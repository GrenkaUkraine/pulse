import { Text } from "@radix-ui/themes";
import {
	type Node,
	type NodeProps,
	useNodeConnections,
	useReactFlow,
	useUpdateNodeInternals,
} from "@xyflow/react";
import { useEffect } from "react";
import { cn } from "../../shared/lib/cn";
import type { PinOption } from "./controls/PinControl";
import NodePin from "./NodePin";
import NodePinControl, { type PinValue } from "./NodePinControl";
import type { NodeKind, NodePinDefinition } from "./node.types";

export interface PulseNodeData extends Record<string, unknown> {
	title: string;
	kind: NodeKind;
	pins: NodePinDefinition[];
	values?: Record<string, PinValue>;
	pinOptions?: PinOption[];
}

const headerColors = {
	event: "from-node-event-from to-node-event-to",
	action: "from-node-action-from to-node-action-to",
	flow: "from-node-flow-from to-node-flow-to",
	value: "from-node-value-from to-node-value-to",
	logic: "from-node-logic-from to-node-logic-to",
} satisfies Record<NodeKind, string>;

export type PulseNodeType = Node<PulseNodeData, "pulse">;

export default function PulseNode({
	id,
	data,
	isConnectable,
}: NodeProps<PulseNodeType>) {
	const connections = useNodeConnections();
	const { updateNodeData } = useReactFlow<PulseNodeType>();
	const updateNodeInternals = useUpdateNodeInternals();
	const connectionSignature = connections
		.map((connection) => connection.edgeId)
		.sort()
		.join(",");
	useEffect(() => {
		void connectionSignature;
		updateNodeInternals(id);
	}, [id, connectionSignature, updateNodeInternals]);

	return (
		<div className="flex flex-col gap-4 border border-ui-border rounded-ui-2 bg-ui-background/80 overflow-hidden">
			<div
				className={cn(
					"px-ui-2 py-ui-1 bg-linear-to-r",
					headerColors[data.kind],
				)}
			>
				<Text weight="medium">{data.title}</Text>
			</div>
			<div className="grid grid-cols-2 gap-ui-2 p-ui-2 pt-ui-1">
				{(["input", "output"] as const).map((direction) => (
					<div
						key={direction}
						className={
							direction === "input"
								? "flex flex-col items-start gap-ui-2"
								: "flex flex-col items-end gap-ui-2"
						}
					>
						{data.pins
							.filter((pin) => pin.direction === direction)
							.map((pin) => (
								<NodePin
									key={pin.id}
									pin={pin}
									isConnectable={isConnectable}
									connected={connections.some((connection) =>
										pin.direction === "input"
											? connection.targetHandle === pin.id
											: connection.sourceHandle === pin.id,
									)}
								>
									<NodePinControl
										pin={pin}
										value={data.values?.[pin.id]}
										pinOptions={data.pinOptions ?? []}
										onChange={(value) =>
											updateNodeData(id, (node) => ({
												values: { ...node.data.values, [pin.id]: value },
											}))
										}
									/>
								</NodePin>
							))}
					</div>
				))}
			</div>
		</div>
	);
}
