import { Group, Panel, Separator } from "react-resizable-panels";
import NodePalette from "../features/node-catalog/NodePalette";

export default function WorkbenchLayout() {
	return (
		<Group orientation="horizontal" className="h-full min-h-0">
			<Panel id="nodes" defaultSize="220px" minSize="160px" maxSize="40%">
				<NodePalette />
			</Panel>
			<PanelSeparator />
			<Panel id="workspace" minSize="240px">
				<div className="h-full" />
			</Panel>
		</Group>
	);
}

function PanelSeparator() {
	return (
		<Separator aria-label="Resize" className="w-1 focus-visible:bg-ui-accent" />
	);
}
