import {
	addEdge,
	Background,
	BackgroundVariant,
	type Connection,
	Controls,
	type Edge,
	type NodeTypes,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import { useCallback } from "react";
import PanelContainer from "../../shared/ui/PanelContainer";
import PulseConnectionLine from "./PulseConnectionLine";

import PulseEdge from "./PulseEdge";
import PulseNode, { type PulseNodeType } from "./PulseNode";

const nodeTypes = { pulse: PulseNode } satisfies NodeTypes;

const edgeTypes = { pulse: PulseEdge };
const defaultEdgeOptions = { type: "pulse" };

const initialNodes: PulseNodeType[] = [
	{
		id: "setup",
		type: "pulse",
		position: { x: 80, y: 100 },
		data: {
			title: "On Setup",
			kind: "event",
			pins: [{ id: "exec", direction: "output", dataType: "execution" }],
		},
	},
	{
		id: "delay",
		type: "pulse",
		position: { x: 350, y: 100 },
		data: {
			title: "Delay",
			kind: "action",
			pins: [
				{ id: "exec_in", direction: "input", dataType: "execution" },
				{ id: "exec_out", direction: "output", dataType: "execution" },
			],
		},
	},
];

const initialEdges: Edge[] = [
	{
		id: "setup-delay",
		source: "setup",
		target: "delay",
		sourceHandle: "exec",
		targetHandle: "exec_in",
	},
];

export default function GraphEditor() {
	const [nodes, , onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const onConnect = useCallback(
		(connection: Connection) => {
			if (connection.source === connection.target) return;
			setEdges((current) => addEdge(connection, current));
		},
		[setEdges],
	);

	return (
		<PanelContainer
			hasPadding={false}
			hasGap={false}
			className="overflow-hidden"
		>
			<ReactFlow
				proOptions={{ hideAttribution: true }}
				nodes={nodes}
				nodeTypes={nodeTypes}
				edges={edges}
				edgeTypes={edgeTypes}
				defaultEdgeOptions={defaultEdgeOptions}
				connectionLineComponent={PulseConnectionLine}
				onConnect={onConnect}
				isValidConnection={(connection) =>
					connection.source !== connection.target
				}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				colorMode="dark"
				fitView
			>
				<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
				<Controls />
			</ReactFlow>
		</PanelContainer>
	);
}
