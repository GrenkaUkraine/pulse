import {
	addEdge,
	Background,
	BackgroundVariant,
	type Connection,
	type Edge,
	type NodeTypes,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import PanelContainer from "../../shared/ui/PanelContainer";
import GraphControls from "./GraphControls.tsx";
import GraphMiniMap from "./GraphMiniMap";
import type { NodePinDefinition } from "./node.types";
import PulseConnectionLine from "./PulseConnectionLine";
import PulseEdge from "./PulseEdge";
import PulseNode, { type PulseNodeType } from "./PulseNode";

const nodeTypes = { pulse: PulseNode } satisfies NodeTypes;

const edgeTypes = { pulse: PulseEdge };
const defaultEdgeOptions = { type: "pulse" };

export default function GraphEditor() {
	const [miniMapOpen, setMiniMapOpen] = useState(true);
	const [nodes, , onNodesChange] = useNodesState<PulseNodeType>([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
	const getConnectionPorts = useCallback(
		(connection: Connection | Edge) => {
			const source = nodes
				.find((node) => node.id === connection.source)
				?.data.pins.find((pin) => pin.id === connection.sourceHandle);
			const target = nodes
				.find((node) => node.id === connection.target)
				?.data.pins.find((pin) => pin.id === connection.targetHandle);
			return { source, target };
		},
		[nodes],
	);

	const canConnect = useCallback(
		(connection: Connection | Edge) => {
			if (connection.source === connection.target) return false;
			const { source, target } = getConnectionPorts(connection);
			return (
				source?.direction === "output" &&
				target?.direction === "input" &&
				source.dataType === target.dataType &&
				getPinLimit(source) > 0 &&
				getPinLimit(target) > 0
			);
		},
		[getConnectionPorts],
	);

	const onConnect = useCallback(
		(connection: Connection) => {
			if (!canConnect(connection)) return;
			const { source, target } = getConnectionPorts(connection);
			if (!source || !target) return;
			setEdges((current) => {
				const duplicate = current.some(
					(edge) =>
						edge.source === connection.source &&
						edge.sourceHandle === connection.sourceHandle &&
						edge.target === connection.target &&
						edge.targetHandle === connection.targetHandle,
				);
				if (duplicate) return current;

				const incoming = current.filter(
					(edge) =>
						edge.target === connection.target &&
						edge.targetHandle === connection.targetHandle,
				);
				const removeIncoming = Math.max(
					0,
					incoming.length + 1 - getPinLimit(target),
				);
				const removed = new Set(
					incoming.slice(0, removeIncoming).map((edge) => edge.id),
				);
				const outgoing = current.filter(
					(edge) =>
						!removed.has(edge.id) &&
						edge.source === connection.source &&
						edge.sourceHandle === connection.sourceHandle,
				);
				const removeOutgoing = Math.max(
					0,
					outgoing.length + 1 - getPinLimit(source),
				);
				for (const edge of outgoing.slice(0, removeOutgoing))
					removed.add(edge.id);
				return addEdge(
					connection,
					current.filter((edge) => !removed.has(edge.id)),
				);
			});
		},
		[canConnect, getConnectionPorts, setEdges],
	);
	return (
		<PanelContainer
			hasPadding={false}
			hasGap={false}
			className="overflow-hidden"
		>
			<ReactFlow
				className="pulse-graph"
				proOptions={{ hideAttribution: true }}
				nodes={nodes}
				nodeTypes={nodeTypes}
				edges={edges}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				connectionLineComponent={PulseConnectionLine}
				onConnect={onConnect}
				isValidConnection={(connection) => canConnect(connection)}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				colorMode="dark"
				fitView
			>
				<Background
					variant={BackgroundVariant.Dots}
					color="var(--gray-6)"
					gap={20}
					size={1}
				/>
				<GraphMiniMap
					open={miniMapOpen}
					onToggle={() => setMiniMapOpen((open) => !open)}
				/>
				<GraphControls />
			</ReactFlow>
		</PanelContainer>
	);
}

function getPinLimit(pin: NodePinDefinition): number {
	if (pin.maxConnections === null) return Infinity;
	const limit =
		pin.maxConnections ??
		(pin.direction === "input" || pin.dataType === "execution" ? 1 : Infinity);
	if (limit === Infinity) return limit;
	return Number.isSafeInteger(limit) && limit >= 0 ? limit : 0;
}
