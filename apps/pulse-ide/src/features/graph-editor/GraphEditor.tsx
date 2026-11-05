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
		id: "controls",
		type: "pulse",
		position: { x: 1030, y: 40 },
		data: {
			title: "Input Controls",
			kind: "value",
			values: {
				boolean: true,
				int: 12,
				float: 1.2,
				string: "Hello Pulse",
				pin: 1,
			},
			pinOptions: Array.from({ length: 14 }, (_, value) => ({
				value,
				label: `Pin ${value}`,
			})),
			pins: [
				{
					id: "boolean",
					direction: "input",
					dataType: "boolean",
					title: "Boolean",
					showControl: true,
				},
				{
					id: "int",
					direction: "input",
					dataType: "int",
					title: "Int",
					showControl: true,
				},
				{
					id: "float",
					direction: "input",
					dataType: "float",
					title: "Float",
					showControl: true,
				},
				{
					id: "string",
					direction: "input",
					dataType: "string",
					title: "String",
					showControl: true,
				},
				{
					id: "pin",
					direction: "input",
					dataType: "pin",
					title: "Pin",
					showControl: true,
				},
			],
		},
	},
	{
		id: "setup",
		type: "pulse",
		position: {
			x: 40,
			y: 40,
		},
		data: {
			title: "On Setup",
			kind: "event",
			pins: [
				{
					id: "exec",
					direction: "output",
					dataType: "execution",
				},
			],
		},
	},
	{
		id: "branch",
		type: "pulse",
		position: {
			x: 330,
			y: 40,
		},
		data: {
			title: "Branch",
			kind: "flow",
			pins: [
				{
					id: "exec_in",
					direction: "input",
					dataType: "execution",
				},
				{
					id: "condition",
					direction: "input",
					dataType: "boolean",
					title: "Condition",
				},
				{
					id: "true",
					direction: "output",
					dataType: "execution",
					title: "True",
				},
				{
					id: "false",
					direction: "output",
					dataType: "execution",
					title: "False",
				},
			],
		},
	},
	{
		id: "write",
		type: "pulse",
		position: {
			x: 670,
			y: 40,
		},
		data: {
			title: "Digital Write",
			kind: "action",
			pins: [
				{
					id: "exec_in",
					direction: "input",
					dataType: "execution",
				},
				{
					id: "pin",
					direction: "input",
					dataType: "pin",
					title: "Pin",
				},
				{
					id: "value",
					direction: "input",
					dataType: "boolean",
					title: "Value",
				},
				{
					id: "exec_out",
					direction: "output",
					dataType: "execution",
				},
			],
		},
	},
	{
		id: "values",
		type: "pulse",
		position: {
			x: 40,
			y: 290,
		},
		data: {
			title: "Values Preview",
			kind: "value",
			pins: [
				{
					id: "boolean",
					direction: "output",
					dataType: "boolean",
					title: "Boolean",
				},
				{
					id: "int",
					direction: "output",
					dataType: "int",
					title: "Int",
				},
				{
					id: "float",
					direction: "output",
					dataType: "float",
					title: "Float",
				},
				{
					id: "string",
					direction: "output",
					dataType: "string",
					title: "String",
				},
				{
					id: "pin",
					direction: "output",
					dataType: "pin",
					title: "Pin",
				},
			],
		},
	},
	{
		id: "not",
		type: "pulse",
		position: {
			x: 330,
			y: 290,
		},
		data: {
			title: "NOT",
			kind: "logic",
			pins: [
				{
					id: "input",
					direction: "input",
					dataType: "boolean",
					title: "Input",
				},
				{
					id: "result",
					direction: "output",
					dataType: "boolean",
					title: "Result",
				},
			],
		},
	},
	{
		id: "inputs",
		type: "pulse",
		position: {
			x: 670,
			y: 290,
		},
		data: {
			title: "Inputs Preview",
			kind: "action",
			pins: [
				{
					id: "boolean",
					direction: "input",
					dataType: "boolean",
					title: "Boolean",
				},
				{
					id: "int",
					direction: "input",
					dataType: "int",
					title: "Int",
				},
				{
					id: "float",
					direction: "input",
					dataType: "float",
					title: "Float",
				},
				{
					id: "string",
					direction: "input",
					dataType: "string",
					title: "String",
				},
				{
					id: "pin",
					direction: "input",
					dataType: "pin",
					title: "Pin",
				},
			],
		},
	},
	{
		id: "unlabelled",
		type: "pulse",
		position: {
			x: 330,
			y: 510,
		},
		data: {
			title: "Unlabelled Pins",
			kind: "flow",
			pins: [
				{
					id: "in",
					direction: "input",
					dataType: "float",
				},
				{
					id: "out",
					direction: "output",
					dataType: "float",
				},
			],
		},
	},
];

const initialEdges: Edge[] = [
	{
		id: "preview-0",
		source: "setup",
		sourceHandle: "exec",
		target: "branch",
		targetHandle: "exec_in",
	},
	{
		id: "preview-1",
		source: "branch",
		sourceHandle: "true",
		target: "write",
		targetHandle: "exec_in",
	},
	{
		id: "preview-2",
		source: "values",
		sourceHandle: "boolean",
		target: "not",
		targetHandle: "input",
	},
	{
		id: "preview-3",
		source: "not",
		sourceHandle: "result",
		target: "inputs",
		targetHandle: "boolean",
	},
	{
		id: "preview-4",
		source: "values",
		sourceHandle: "int",
		target: "inputs",
		targetHandle: "int",
	},
	{
		id: "preview-5",
		source: "values",
		sourceHandle: "float",
		target: "inputs",
		targetHandle: "float",
	},
	{
		id: "preview-6",
		source: "values",
		sourceHandle: "string",
		target: "inputs",
		targetHandle: "string",
	},
	{
		id: "preview-7",
		source: "values",
		sourceHandle: "pin",
		target: "inputs",
		targetHandle: "pin",
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
