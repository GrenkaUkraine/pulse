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
			style={{ ...style, stroke: "white", strokeWidth: 1.5 }}
		/>
	);
}

export function getPulseEdgePath(
	sourceX: number,
	sourceY: number,
	targetX: number,
	targetY: number,
): string {
	const lead = 16;
	const startX = sourceX + lead;
	const endX = targetX - lead;
	const bend = Math.max(40, Math.abs(endX - startX) / 2);
	return [
		`M ${sourceX} ${sourceY}`,
		`L ${startX} ${sourceY}`,
		`C ${startX + bend} ${sourceY}, ${endX - bend} ${targetY}, ${endX} ${targetY}`,
		`L ${targetX} ${targetY}`,
	].join(" ");
}
