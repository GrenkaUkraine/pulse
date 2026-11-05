import { BaseEdge, type EdgeProps } from "@xyflow/react";

export default function PulseEdge({
	sourceX,
	sourceY,
	targetX,
	targetY,
	style,
	...props
}: EdgeProps) {
	const path = getPulseEdgePath(sourceX, sourceY, targetX, targetY);

	return (
		<BaseEdge
			id={props.id}
			path={path}
			interactionWidth={props.interactionWidth}
			style={{
				...style,
				stroke: "var(--pulse-edge-stroke, white)",
				strokeWidth: 1.5,
			}}
		/>
	);
}

export function getPulseEdgePath(
	sourceX: number,
	sourceY: number,
	targetX: number,
	targetY: number,
): string {
	const distanceX = targetX - sourceX;
	const distanceY = targetY - sourceY;
	const isForward = distanceX > 0;
	const lead = isForward ? Math.min(16, distanceX / 4) : 8;
	const startX = sourceX + lead;
	const endX = targetX - lead;
	const bend = isForward
		? Math.min(100, (endX - startX) / 2)
		: Math.min(100, 20 + Math.hypot(distanceX, distanceY) / 4);
	return [
		`M ${sourceX} ${sourceY}`,
		`L ${startX} ${sourceY}`,
		`C ${startX + bend} ${sourceY}, ${endX - bend} ${targetY}, ${endX} ${targetY}`,
		`L ${targetX} ${targetY}`,
	].join(" ");
}
