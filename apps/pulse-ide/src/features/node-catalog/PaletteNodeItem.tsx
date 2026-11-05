import { useReactFlow, useStoreApi } from "@xyflow/react";
import { getNodeIcon, nodeIconColors } from "../../shared/icons/node-icons";
import { cn } from "../../shared/lib/cn";
import { useGraphStore } from "../graph-editor/graph.store";

import type { NodeDefinition } from "../graph-editor/node.types";
import type { PulseNodeType } from "../graph-editor/PulseNode";

interface PaletteNodeItemProps {
	node: NodeDefinition;
}

export default function PaletteNodeItem({ node }: PaletteNodeItemProps) {
	const { getNodes, getViewport } = useReactFlow<PulseNodeType>();
	const store = useStoreApi();
	const Icon = getNodeIcon(node.icon);
	const mutate = useGraphStore((state) => state.mutate);
	const ready = useGraphStore((state) => state.status === "ready");

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
		void mutate({ type: "createNode", typeId: node.id, position });
	}
	return (
		<button
			type="button"
			title={node.description}
			onClick={addNode}
			disabled={!ready}
			className="group flex w-full items-center gap-ui-2 rounded-ui-2 px-ui-2 py-ui-2 text-left hover:bg-ui-gray-4 cursor-pointer select-none"
		>
			<Icon
				aria-hidden="true"
				className={cn("size-4 shrink-0", nodeIconColors[node.kind])}
			/>
			<div className="min-w-0">
				<div className="truncate text-xs text-ui-foreground">{node.title}</div>
				<div className="truncate text-[10px] text-ui-muted">
					{node.description}
				</div>
			</div>
		</button>
	);
}
