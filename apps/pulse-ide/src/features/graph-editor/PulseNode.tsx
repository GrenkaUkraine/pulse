import { Text } from "@radix-ui/themes";
import { type Node, type NodeProps, useNodeConnections } from "@xyflow/react";
import NodePin from "./NodePin";
import type { NodePinDefinition } from "./node.types";

export interface PulseNodeData extends Record<string, unknown> {
	title: string;
	pins: NodePinDefinition[];
}

export type PulseNodeType = Node<PulseNodeData, "pulse">;

export default function PulseNode({
	data,
	isConnectable,
}: NodeProps<PulseNodeType>) {
	const connections = useNodeConnections();

	return (
		<div className="flex flex-col gap-4 border border-ui-border rounded-ui-2 bg-ui-background/80 overflow-hidden">
			<div className="px-ui-2 py-ui-1 bg-red-900">
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
								/>
							))}
					</div>
				))}
			</div>
		</div>
	);
}
