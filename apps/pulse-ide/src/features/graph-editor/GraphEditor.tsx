import {
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	type NodeTypes,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import PanelContainer from "../../shared/ui/PanelContainer";

import PulseNode, { type PulseNodeType } from "./PulseNode";

const nodeTypes = { pulse: PulseNode } satisfies NodeTypes;

const initialNodes: PulseNodeType[] = [
	{
		id: "setup",
		type: "pulse",
		position: { x: 80, y: 100 },
		data: {
			title: "On Setup",
			pins: [{ id: "exec", direction: "output", dataType: "execution" }],
		},
	},
	{
		id: "delay",
		type: "pulse",
		position: { x: 350, y: 100 },
		data: {
			title: "Delay",
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
	const [edges, , onEdgesChange] = useEdgesState(initialEdges);

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
