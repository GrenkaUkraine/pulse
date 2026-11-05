import { MapIcon } from "@heroicons/react/24/outline";
import { MapIcon as MapIconFilled } from "@heroicons/react/24/solid";
import { MiniMap, Panel, useViewport } from "@xyflow/react";
import { ToolbarButton } from "../../shared/ui/ToolbarButton";

interface GraphMiniMapProps {
	open: boolean;
	onToggle: () => void;
}

export default function GraphMiniMap({ open, onToggle }: GraphMiniMapProps) {
	const { zoom } = useViewport();

	return (
		<Panel position="bottom-right" className="flex flex-col items-end gap-ui-1">
			<div className="flex items-center gap-ui-2 rounded-ui-2 border border-ui-border bg-ui-panel p-ui-1">
				<span
					className="px-ui-1 text-xs text-ui-muted tabular-nums"
					title="Zoom"
				>
					{Math.round(zoom * 100)}%
				</span>
				<ToolbarButton
					icon={MapIcon}
					activeIcon={MapIconFilled}
					aria-label={open ? "Hide minimap" : "Show minimap"}
					active={open}
					onClick={onToggle}
					size="1"
				/>
			</div>
			{open && (
				<MiniMap
					className="pulse-minimap"
					pannable
					zoomable
					nodeClassName={(node) =>
						`pulse-minimap-node-${String(node.data.kind)}`
					}
					style={{
						position: "relative",
						margin: 0,
						right: "auto",
						bottom: "auto",
					}}
				/>
			)}
		</Panel>
	);
}
