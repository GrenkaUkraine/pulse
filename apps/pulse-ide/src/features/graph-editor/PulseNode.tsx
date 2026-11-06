import { Text } from "@radix-ui/themes";
import {
	type Node,
	type NodeProps,
	useNodeConnections,
	useUpdateNodeInternals,
} from "@xyflow/react";
import { useEffect } from "react";
import { getNodeIcon, nodeIconColors } from "../../shared/icons/node-icons";
import { cn } from "../../shared/lib/cn";
import type { PinOption } from "./controls/PinControl";
import { useGraphStore } from "./graph.store";
import NodePin from "./NodePin";
import NodePinControl from "./NodePinControl";
import type { NodeDefinition, NodeKind, PinValue } from "./node.types";

export interface PulseNodeData
	extends Record<string, unknown>,
		Pick<NodeDefinition, "title" | "pins" | "kind" | "icon"> {
	typeId: string;
	enabled: boolean;
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
	selected,
}: NodeProps<PulseNodeType>) {
	const connections = useNodeConnections();
	const Icon = getNodeIcon(data.icon);
	const mutate = useGraphStore((state) => state.mutate);
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
		<div
			className={cn(
				"flex flex-col gap-4 border rounded-ui-2 bg-ui-background/80 overflow-hidden",
				!data.enabled && "opacity-50",
				selected ? "border-ui-accent" : "border-ui-border",
			)}
		>
			<div
				className={cn(
					"flex items-center gap-ui-2 px-ui-2 py-ui-1 bg-linear-to-r",
					headerColors[data.kind],
				)}
			>
				<Icon
					aria-hidden="true"
					className={cn("size-4 shrink-0", nodeIconColors[data.kind])}
				/>
				<Text weight="medium">{data.title}</Text>
			</div>
			<div className="flex justify-between gap-ui-2 p-ui-2 pt-ui-1">
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
											? connection.target === id &&
												connection.targetHandle === pin.id
											: connection.source === id &&
												connection.sourceHandle === pin.id,
									)}
								>
									<NodePinControl
										pin={pin}
										value={data.values?.[pin.id]}
										pinOptions={data.pinOptions ?? []}
										onChange={(value) =>
											void mutate({
												type: "setValue",
												nodeId: id,
												portId: pin.id,
												value,
											})
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
