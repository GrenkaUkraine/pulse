import {
	Background,
	BackgroundVariant,
	type Connection,
	type Edge,
	type NodeTypes,
	ReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import PanelContainer from "../../shared/ui/PanelContainer";
import { getPinLimit } from "./connection-preview";
import GraphControls from "./GraphControls";
import GraphMiniMap from "./GraphMiniMap";
import { useGraphStore } from "./graph.store";
import PulseConnectionLine from "./PulseConnectionLine";
import PulseEdge from "./PulseEdge";
import PulseNode from "./PulseNode";

const nodeTypes = { pulse: PulseNode } satisfies NodeTypes;
const edgeTypes = { pulse: PulseEdge };
const defaultEdgeOptions = { type: "pulse" };

export default function GraphEditor() {
	const [miniMapOpen, setMiniMapOpen] = useState(true);
	const nodes = useGraphStore((state) => state.nodes);
	const edges = useGraphStore((state) => state.edges);
	const onNodesChange = useGraphStore((state) => state.onNodesChange);
	const onEdgesChange = useGraphStore((state) => state.onEdgesChange);
	const loadGraph = useGraphStore((state) => state.loadGraph);
	const mutate = useGraphStore((state) => state.mutate);
	const status = useGraphStore((state) => state.status);

	useEffect(() => {
		void loadGraph();
	}, [loadGraph]);

	const canConnect = useCallback(
		(connection: Connection | Edge) => {
			if (connection.source === connection.target) return false;
			const source = nodes
				.find((node) => node.id === connection.source)
				?.data.pins.find((pin) => pin.id === connection.sourceHandle);
			const target = nodes
				.find((node) => node.id === connection.target)
				?.data.pins.find((pin) => pin.id === connection.targetHandle);
			return (
				source?.direction === "output" &&
				target?.direction === "input" &&
				source.dataType === target.dataType &&
				getPinLimit(source) > 0 &&
				getPinLimit(target) > 0
			);
		},
		[nodes],
	);

	const onConnect = useCallback(
		(connection: Connection) => {
			if (!connection.sourceHandle || !connection.targetHandle) return;
			void mutate({
				type: "connect",
				source: connection.source,
				sourceHandle: connection.sourceHandle,
				target: connection.target,
				targetHandle: connection.targetHandle,
			});
		},
		[mutate],
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
				isValidConnection={canConnect}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onBeforeDelete={async ({ nodes, edges }) => {
					await mutate({
						type: "deleteElements",
						nodeIds: nodes.map((node) => node.id),
						edgeIds: edges.map((edge) => edge.id),
					});
					return false;
				}}
				nodesDraggable={status === "ready"}
				nodesConnectable={status === "ready"}
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
