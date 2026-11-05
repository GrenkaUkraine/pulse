import type { ConnectionLineComponentProps } from "@xyflow/react";
import { getPulseEdgePath } from "./PulseEdge";

export default function PulseConnectionLine({
	fromX,
	fromY,
	toX,
	toY,
	fromHandle,
}: ConnectionLineComponentProps) {
	const path =
		fromHandle.type === "source"
			? getPulseEdgePath(fromX, fromY, toX, toY)
			: getPulseEdgePath(toX, toY, fromX, fromY);

	return <path d={path} fill="none" stroke="white" strokeWidth={1.5} />;
}
