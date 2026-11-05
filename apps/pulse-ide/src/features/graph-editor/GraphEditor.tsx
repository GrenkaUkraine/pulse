import {
	Background,
	BackgroundVariant,
	Controls,
	type Edge,
	type Node,
	ReactFlow,
	useEdgesState,
	useNodesState,
} from "@xyflow/react";
import PanelContainer from "../../shared/ui/PanelContainer";

const initialNodes: Node[] = [
	{
		id: "setup",
		type: "input",
		position: { x: 80, y: 100 },
		data: { label: "On Setup" },
	},
	{
		id: "delay",
		position: { x: 350, y: 100 },
		data: { label: "Delay" },
	},
];

const initialEdges: Edge[] = [
	{
		id: "setup-delay",
		source: "setup",
		target: "delay",
	},
];

export default function GraphEditor() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
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
