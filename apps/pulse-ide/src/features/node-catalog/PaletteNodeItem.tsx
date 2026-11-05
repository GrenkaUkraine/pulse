import { CubeIcon } from "@heroicons/react/24/outline";
import { useReactFlow, useStoreApi } from "@xyflow/react";

import type { NodeDefinition, PinValue } from "../graph-editor/node.types";
import type { PulseNodeType } from "../graph-editor/PulseNode";

interface PaletteNodeItemProps {
	node: NodeDefinition;
}

export default function PaletteNodeItem({ node }: PaletteNodeItemProps) {
	const { addNodes, getNodes, getViewport } = useReactFlow<PulseNodeType>();
	const store = useStoreApi();

	function addNode() {
		const { width, height } = store.getState();
		if (width <= 0 || height <= 0) return;
		const viewport = getViewport();
		const position = {
			x: (width / 2 - viewport.x) / viewport.zoom - 100,
			y: (height / 2 - viewport.y) / viewport.zoom - 40,
		};
		const existing = getNodes();
		while (
			existing.some(
				(item) =>
					Math.abs(item.position.x - position.x) < 24 &&
					Math.abs(item.position.y - position.y) < 24,
			)
		) {
			position.x += 32;
			position.y += 32;
		}
		const values: Record<string, PinValue> = {};
		for (const pin of node.pins) {
			if (pin.dataType !== "execution" && pin.defaultValue !== undefined)
				values[pin.id] = pin.defaultValue;
		}
		addNodes({
			id: crypto.randomUUID(),
			type: "pulse",
			position,
			data: {
				title: node.title,
				kind: node.kind,
				pins: node.pins.map((pin) => ({ ...pin })),
				typeId: node.id,
				values,
			},
		});
	}
	return (
		<button
			type="button"
			title={node.description}
			onClick={addNode}
			className="group flex w-full items-center gap-ui-2 rounded-ui-2 px-ui-2 py-ui-2 text-left hover:bg-ui-gray-4 cursor-pointer select-none"
		>
			<CubeIcon aria-hidden="true" className="size-4 shrink-0 text-ui-muted" />
			<div className="min-w-0">
				<div className="truncate text-xs text-ui-foreground">{node.title}</div>
				<div className="truncate text-[10px] text-ui-muted">
					{node.description}
				</div>
			</div>
		</button>
	);
}
