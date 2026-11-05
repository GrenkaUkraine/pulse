import type { Edge } from "@xyflow/react";
import type { NodePinDefinition } from "./node.types";
import type { PulseNodeType } from "./PulseNode";

export function getPinLimit(pin: NodePinDefinition): number {
	if (pin.maxConnections === null) return Infinity;
	const limit =
		pin.maxConnections ??
		(pin.direction === "input" || pin.dataType === "execution" ? 1 : Infinity);
	if (limit === Infinity) return limit;
	return Number.isSafeInteger(limit) && limit >= 0 ? limit : 0;
}

export function previewConnection(
	edges: Edge[],
	edge: Edge,
	nodes: PulseNodeType[],
): Edge[] {
	const source = nodes
		.find((node) => node.id === edge.source)
		?.data.pins.find((pin) => pin.id === edge.sourceHandle);
	const target = nodes
		.find((node) => node.id === edge.target)
		?.data.pins.find((pin) => pin.id === edge.targetHandle);
	if (
		!source ||
		!target ||
		source.direction !== "output" ||
		target.direction !== "input" ||
		edge.source === edge.target ||
		source.dataType !== target.dataType ||
		getPinLimit(source) === 0 ||
		getPinLimit(target) === 0
	)
		return edges;
	if (
		edges.some(
			(current) =>
				current.source === edge.source &&
				current.sourceHandle === edge.sourceHandle &&
				current.target === edge.target &&
				current.targetHandle === edge.targetHandle,
		)
	)
		return edges;
	const incoming = edges.filter(
		(current) =>
			current.target === edge.target &&
			current.targetHandle === edge.targetHandle,
	);
	const removed = new Set(
		incoming
			.slice(0, Math.max(0, incoming.length + 1 - getPinLimit(target)))
			.map((current) => current.id),
	);
	const outgoing = edges.filter(
		(current) =>
			!removed.has(current.id) &&
			current.source === edge.source &&
			current.sourceHandle === edge.sourceHandle,
	);
	for (const current of outgoing.slice(
		0,
		Math.max(0, outgoing.length + 1 - getPinLimit(source)),
	))
		removed.add(current.id);
	return [...edges.filter((current) => !removed.has(current.id)), edge];
}
