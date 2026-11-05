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
	const canConnect = useCallback(
		(connection: Connection | Edge) => {
			if (connection.source === connection.target) return false;
			const target = nodes.find((node) => node.id === connection.target);
			const pin = target?.data.pins.find(
				(pin) => pin.id === connection.targetHandle,
			);
			if (pin?.direction !== "input") return false;
			const limit = pin.maxConnections ?? 1;
			return Number.isSafeInteger(limit) && limit > 0;
		},
		[nodes],
	);
	const onConnect = useCallback(
		(connection: Connection) => {
			if (!canConnect(connection)) return;
			const target = nodes.find((node) => node.id === connection.target);
			const pin = target?.data.pins.find(
				(pin) => pin.id === connection.targetHandle,
			);
			if (pin?.direction !== "input") return;
			const limit = pin.maxConnections ?? 1;

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
				const removedIds = new Set(
					incoming
						.slice(0, Math.max(0, incoming.length - limit + 1))
						.map((edge) => edge.id),
				);
				return addEdge(
					connection,
					current.filter((edge) => !removedIds.has(edge.id)),
				);
			});
		},
		[canConnect, nodes, setEdges],
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
