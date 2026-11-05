import {
	ArrowsPointingOutIcon,
	MinusIcon,
	PlusIcon,
} from "@heroicons/react/24/outline";
import { Panel, useReactFlow } from "@xyflow/react";
import { ToolbarButton } from "../../shared/ui/ToolbarButton";
import { ToolbarGroup } from "../../shared/ui/ToolbarGroup";

export default function GraphControls() {
	const { zoomIn, zoomOut, fitView } = useReactFlow();

	return (
		<Panel position="bottom-left">
			<ToolbarGroup
				direction="vertical"
				className="rounded-ui-3 border border-ui-border bg-ui-panel !p-ui-1"
			>
				<ToolbarButton
					icon={PlusIcon}
					aria-label="Zoom in"
					onClick={() => void zoomIn({ duration: 150 })}
					size="1"
				/>
				<ToolbarButton
					icon={MinusIcon}
					aria-label="Zoom out"
					onClick={() => void zoomOut({ duration: 150 })}
					size="1"
				/>
				<ToolbarButton
					icon={ArrowsPointingOutIcon}
					aria-label="Fit graph"
					onClick={() => void fitView({ padding: 0.2, duration: 200 })}
					size="1"
				/>
			</ToolbarGroup>
		</Panel>
	);
}
