import { type PointerEvent, useEffect, useRef, useState } from "react";
import { useGraphStore } from "./graph.store";

interface Point {
	x: number;
	y: number;
}
interface Wire {
	id: string;
	path: SVGPathElement;
	points: Point[];
}
interface Gesture {
	pointerId: number;
	previous: Point;
	wires: Wire[];
	cut: Set<string>;
	element: HTMLDivElement;
}

function distanceToSegment(point: Point, start: Point, end: Point): number {
	const dx = end.x - start.x;
	const dy = end.y - start.y;
	const length = dx * dx + dy * dy;
	const t =
		length === 0
			? 0
			: Math.max(
					0,
					Math.min(
						1,
						((point.x - start.x) * dx + (point.y - start.y) * dy) / length,
					),
				);
	return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
}

function intersects(a: Point, b: Point, c: Point, d: Point): boolean {
	if (
		Math.min(a.x, b.x) <= Math.max(c.x, d.x) &&
		Math.max(a.x, b.x) >= Math.min(c.x, d.x) &&
		Math.min(a.y, b.y) <= Math.max(c.y, d.y) &&
		Math.max(a.y, b.y) >= Math.min(c.y, d.y)
	) {
		const cross = (p: Point, q: Point, r: Point) =>
			(q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
		if (
			cross(a, b, c) * cross(a, b, d) <= 0 &&
			cross(c, d, a) * cross(c, d, b) <= 0
		)
			return true;
	}
	return (
		Math.min(
			distanceToSegment(a, c, d),
			distanceToSegment(b, c, d),
			distanceToSegment(c, a, b),
			distanceToSegment(d, a, b),
		) <= 3
	);
}

export function useWireCutting() {
	const gesture = useRef<Gesture | null>(null);
	const [cutting, setCutting] = useState(false);

	function reset() {
		const current = gesture.current;
		if (!current) return;
		gesture.current = null;
		for (const wire of current.wires)
			wire.path.classList.remove("pulse-edge-cut");
		if (current.element.hasPointerCapture(current.pointerId))
			current.element.releasePointerCapture(current.pointerId);
		setCutting(false);
	}

	useEffect(() => {
		function cancel(event: KeyboardEvent) {
			if (event.code !== "Escape" || !gesture.current) return;
			event.preventDefault();
			const current = gesture.current;
			gesture.current = null;
			for (const wire of current.wires)
				wire.path.classList.remove("pulse-edge-cut");
			if (current.element.hasPointerCapture(current.pointerId))
				current.element.releasePointerCapture(current.pointerId);
			setCutting(false);
		}
		window.addEventListener("keydown", cancel, true);
		return () => {
			window.removeEventListener("keydown", cancel, true);
			const current = gesture.current;
			if (!current) return;
			gesture.current = null;
			for (const wire of current.wires)
				wire.path.classList.remove("pulse-edge-cut");
			if (current.element.hasPointerCapture(current.pointerId))
				current.element.releasePointerCapture(current.pointerId);
		};
	}, []);

	function onPointerDownCapture(event: PointerEvent<HTMLDivElement>) {
		if (
			!event.altKey ||
			event.button !== 0 ||
			gesture.current ||
			useGraphStore.getState().status !== "ready"
		)
			return;
		if (
			event.target instanceof Element &&
			event.target.closest(
				".react-flow__panel, input, textarea, select, button, .nodrag",
			)
		)
			return;
		event.preventDefault();
		event.stopPropagation();
		const wires: Wire[] = [];
		for (const path of event.currentTarget.querySelectorAll<SVGPathElement>(
			".react-flow__edge-path",
		)) {
			const id = path.closest(".react-flow__edge")?.getAttribute("data-id");
			const matrix = path.getScreenCTM();
			if (!id || !matrix) continue;
			const length = path.getTotalLength();
			const scale = Math.max(
				Math.hypot(matrix.a, matrix.b),
				Math.hypot(matrix.c, matrix.d),
			);
			const steps = Math.max(
				1,
				Math.min(2048, Math.ceil((length * scale) / 4)),
			);
			const points: Point[] = [];
			for (let i = 0; i <= steps; i++) {
				points.push(
					path.getPointAtLength((length * i) / steps).matrixTransform(matrix),
				);
			}
			wires.push({ id, path, points });
		}
		event.currentTarget.setPointerCapture(event.pointerId);
		gesture.current = {
			pointerId: event.pointerId,
			previous: { x: event.clientX, y: event.clientY },
			wires,
			cut: new Set(),
			element: event.currentTarget,
		};
		setCutting(true);
	}

	function markIntersections(event: PointerEvent<HTMLDivElement>) {
		const current = gesture.current;
		if (!current || event.pointerId !== current.pointerId) return;
		event.preventDefault();
		event.stopPropagation();
		const point = { x: event.clientX, y: event.clientY };
		if (point.x === current.previous.x && point.y === current.previous.y)
			return;
		for (const wire of current.wires) {
			if (current.cut.has(wire.id)) continue;
			for (let i = 1; i < wire.points.length; i++) {
				if (
					intersects(
						current.previous,
						point,
						wire.points[i - 1],
						wire.points[i],
					)
				) {
					current.cut.add(wire.id);
					wire.path.classList.add("pulse-edge-cut");
					break;
				}
			}
		}
		current.previous = point;
	}

	function onPointerUpCapture(event: PointerEvent<HTMLDivElement>) {
		const current = gesture.current;
		if (!current || event.pointerId !== current.pointerId) return;
		markIntersections(event);
		const edgeIds = [...current.cut];
		reset();
		if (edgeIds.length > 0)
			void useGraphStore
				.getState()
				.mutate({ type: "deleteElements", nodeIds: [], edgeIds });
	}

	function onPointerCancelCapture(event: PointerEvent<HTMLDivElement>) {
		if (event.pointerId === gesture.current?.pointerId) reset();
	}

	return {
		cutting,
		handlers: {
			onPointerDownCapture,
			onPointerMoveCapture: markIntersections,
			onPointerUpCapture,
			onPointerCancelCapture,
			onLostPointerCapture: onPointerCancelCapture,
		},
	};
}
