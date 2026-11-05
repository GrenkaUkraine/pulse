import {
	applyEdgeChanges,
	applyNodeChanges,
	type Edge,
	type EdgeChange,
	type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import { useCatalogStore } from "../node-catalog/catalog.store";
import { previewConnection } from "./connection-preview";
import {
	applyGraphAction,
	type GraphAction,
	type GraphSnapshot,
	getGraph,
} from "./graph.api";
import type { NodeInstance } from "./node.types";
import type { PulseNodeType } from "./PulseNode";

interface GraphState {
	nodes: PulseNodeType[];
	edges: Edge[];
	canUndo: boolean;
	canRedo: boolean;
	pending: number;
	status: "idle" | "loading" | "ready" | "error";
	loadGraph: () => Promise<void>;
	mutate: (action: GraphAction) => Promise<boolean>;
	onNodesChange: (changes: NodeChange<PulseNodeType>[]) => void;
	onEdgesChange: (changes: EdgeChange[]) => void;
}

let queue: Promise<unknown> = Promise.resolve();
let moveSequence = 0;
let latestSnapshot: GraphSnapshot | undefined;
let queuedRequests = 0;
const pendingConnections = new Map<number, Edge>();
const confirmedIds = new Map<string, string>();
const pendingPositions = new Map<
	string,
	{ position: NodeInstance["position"]; sequence: number }
>();

function applySnapshot(snapshot: GraphSnapshot) {
	const definitions = useCatalogStore.getState().definitions;
	const previous = useGraphStore.getState();
	const existingNodes = new Map(previous.nodes.map((node) => [node.id, node]));
	const existingEdges = new Map(previous.edges.map((edge) => [edge.id, edge]));
	const nodes: PulseNodeType[] = snapshot.nodes.map((instance) => {
		const definition = definitions.find((item) => item.id === instance.typeId);
		if (!definition) throw new Error(`Unknown node type: ${instance.typeId}`);
		const old = existingNodes.get(instance.id);
		return {
			...old,
			id: instance.id,
			type: "pulse",
			position:
				pendingPositions.get(instance.id)?.position ??
				(old?.dragging ? old.position : instance.position),
			data: {
				typeId: instance.typeId,
				title: definition.title,
				icon: definition.icon,
				kind: definition.kind,
				pins: definition.pins,
				values: instance.values,
			},
		};
	});
	let edges: Edge[] = snapshot.edges.map((edge) => ({
		...existingEdges.get(edge.id),
		...edge,
		type: "pulse",
	}));
	for (const edge of pendingConnections.values()) {
		edges = previewConnection(edges, edge, nodes);
	}
	latestSnapshot = snapshot;
	useGraphStore.setState({
		nodes,
		edges,
		canUndo: snapshot.canUndo,
		canRedo: snapshot.canRedo,
		status: "ready",
	});
}

export const useGraphStore = create<GraphState>((set, get) => ({
	nodes: [],
	edges: [],
	canUndo: false,
	canRedo: false,
	pending: 0,
	status: "idle",
	async loadGraph() {
		if (get().status === "loading" || get().status === "ready") return;
		set({ status: "loading" });
		const job = queue.then(async () => {
			try {
				await useCatalogStore.getState().loadCatalog();
				if (useCatalogStore.getState().status !== "ready") {
					throw new Error(
						useCatalogStore.getState().error ?? "Catalog is unavailable",
					);
				}
				applySnapshot(await getGraph());
			} catch (reason) {
				console.error("Failed to load graph:", reason);
				set({ status: "error" });
			}
		});
		queue = job;
		await job;
	},
	mutate(action) {
		if (get().status !== "ready") return Promise.resolve(false);
		if (
			(action.type === "undo" || action.type === "redo") &&
			(get().pending > 0 || get().nodes.some((node) => node.dragging))
		)
			return Promise.resolve(false);
		set({ pending: get().pending + 1 });
		const sequence = ++moveSequence;
		queuedRequests += 1;
		if (action.type === "connect") {
			const edge: Edge = {
				id: crypto.randomUUID(),
				type: "pulse",
				source: action.source,
				sourceHandle: action.sourceHandle,
				target: action.target,
				targetHandle: action.targetHandle,
			};
			pendingConnections.set(sequence, edge);
			set({ edges: previewConnection(get().edges, edge, get().nodes) });
		}
		if (action.type === "moveNodes") {
			for (const node of action.nodes) {
				pendingPositions.set(node.id, { position: node.position, sequence });
			}
		}
		function clearPendingMoves() {
			if (action.type !== "moveNodes") return;
			for (const node of action.nodes) {
				if (pendingPositions.get(node.id)?.sequence === sequence)
					pendingPositions.delete(node.id);
			}
		}
		const job = queue.then(async () => {
			try {
				let request = action;
				if (action.type === "deleteElements") {
					request = {
						...action,
						edgeIds: action.edgeIds.map((id) => confirmedIds.get(id) ?? id),
					};
				} else if (action.type === "disconnect") {
					request = {
						...action,
						edgeId: confirmedIds.get(action.edgeId) ?? action.edgeId,
					};
				}
				const snapshot = await applyGraphAction(request);
				const pending = pendingConnections.get(sequence);
				if (pending) {
					const confirmed = snapshot.edges.find(
						(edge) =>
							edge.source === pending.source &&
							edge.sourceHandle === pending.sourceHandle &&
							edge.target === pending.target &&
							edge.targetHandle === pending.targetHandle,
					);
					if (confirmed) confirmedIds.set(pending.id, confirmed.id);
				}
				pendingConnections.delete(sequence);
				clearPendingMoves();
				applySnapshot(snapshot);

				return true;
			} catch (reason) {
				pendingConnections.delete(sequence);
				clearPendingMoves();
				try {
					applySnapshot(await getGraph());
				} catch (recoveryError) {
					if (latestSnapshot) applySnapshot(latestSnapshot);
					console.error("Failed to refresh graph:", recoveryError);
					set({ status: "error" });
				}
				console.error("Graph action failed:", action, reason);
				return false;
			} finally {
				queuedRequests -= 1;
				set({ pending: get().pending - 1 });
				if (queuedRequests === 0) confirmedIds.clear();
			}
		});
		queue = job;
		return job;
	},
	onNodesChange(changes) {
		const localChanges = changes.filter(
			(change) =>
				change.type === "position" ||
				change.type === "dimensions" ||
				change.type === "select",
		);
		set({ nodes: applyNodeChanges(localChanges, get().nodes) });
		const ids = new Set(
			changes.flatMap((change) =>
				change.type === "position" && change.dragging !== true
					? [change.id]
					: [],
			),
		);
		const nodes = get()
			.nodes.filter((node) => ids.has(node.id))
			.map(({ id, position }) => ({ id, position }));
		if (nodes.length > 0) void get().mutate({ type: "moveNodes", nodes });
	},
	onEdgesChange(changes) {
		set({
			edges: applyEdgeChanges(
				changes.filter((change) => change.type === "select"),
				get().edges,
			),
		});
	},
}));
