import { Handle, Position } from "@xyflow/react";
import type { ReactNode } from "react";
import {
	DataPinFilledIcon,
	DataPinIcon,
	ExecutionPinFilledIcon,
	ExecutionPinIcon,
} from "../../assets/pins";
import { cn } from "../../shared/lib/cn.ts";
import type { NodePinDefinition, PinType } from "./node.types.ts";

const pinColors = {
	execution: "text-pin-execution",
	pin: "text-pin-pin",
	boolean: "text-pin-boolean",
	int: "text-pin-int",
	float: "text-pin-float",
	string: "text-pin-string",
} satisfies Record<PinType, string>;

interface NodePinProps {
	pin: NodePinDefinition;
	connected?: boolean;
	isConnectable?: boolean;
	children?: ReactNode;
}

export default function NodePin({
	pin,
	connected = false,
	isConnectable = true,
	children,
}: NodePinProps) {
	const isInput = pin.direction === "input";
	const isExecution = pin.dataType === "execution";

	const OutlineIcon = isExecution ? ExecutionPinIcon : DataPinIcon;
	const FilledIcon = isExecution ? ExecutionPinFilledIcon : DataPinFilledIcon;
	const Icon = connected ? FilledIcon : OutlineIcon;

	const showControl =
		!isExecution && (pin.showControl ?? isInput) && (!isInput || !connected);

	return (
		<div
			className={cn(
				"flex min-h-6 items-center gap-ui-2",
				!isInput && "flex-row-reverse",
			)}
		>
			<div
				className={cn(
					"relative size-4 shrink-0",
					pin.dataType !== "execution" && pin.control === "pin"
						? "text-pin-pin"
						: pinColors[pin.dataType],
				)}
			>
				<Icon
					aria-hidden="true"
					className="pointer-events-none block size-full"
				/>

				<Handle
					id={pin.id}
					type={isInput ? "target" : "source"}
					position={isInput ? Position.Left : Position.Right}
					isConnectable={isConnectable}
					aria-label={pin.title ?? pin.id}
					style={{
						inset: 0,
						width: "100%",
						height: "100%",
						transform: "none",
						border: 0,
						borderRadius: 0,
						background: "transparent",
					}}
				/>
			</div>

			<div
				className={cn(
					"flex min-w-0 items-center gap-ui-2",
					!isInput && "flex-row-reverse",
					pin.dataType === "string" && isInput && "flex-wrap",
				)}
			>
				{pin.title && <span className="text-xs">{pin.title}</span>}

				{showControl && (
					<div className="nodrag nopan inline-flex">{children}</div>
				)}
			</div>
		</div>
	);
}
