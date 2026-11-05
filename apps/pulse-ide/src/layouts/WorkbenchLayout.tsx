import { Group, Panel, Separator } from "react-resizable-panels";
import GraphEditor from "../features/graph-editor/GraphEditor";
import NodeInspector from "../features/graph-editor/NodeInspector";
import NodePalette from "../features/node-catalog/NodePalette";
import OutputPanel from "../features/output/OutputPanel";
import { cn } from "../shared/lib/cn";

interface WorkbenchLayoutProps {
	nodesOpen: boolean;
	inspectorOpen: boolean;
	outputOpen: boolean;
}

export default function WorkbenchLayout({
	nodesOpen,
	inspectorOpen,
	outputOpen,
}: WorkbenchLayoutProps) {
	return (
		<Group orientation="vertical" className="h-full min-h-0">
			<Panel id="editor-area" minSize="240px">
				<Group orientation="horizontal" className="h-full min-h-0">
					{nodesOpen && (
						<>
							<Panel
								id="nodes"
								defaultSize="220px"
								minSize="160px"
								maxSize="40%"
							>
								<NodePalette />
							</Panel>
							<PanelSeparator label="Resize node palette" />
						</>
					)}
					<Panel id="workspace" minSize="240px">
						<GraphEditor />
					</Panel>
					{inspectorOpen && (
						<>
							<PanelSeparator label="Resize node inspector" />
							<Panel
								id="inspector"
								defaultSize="240px"
								minSize="160px"
								maxSize="40%"
							>
								<NodeInspector />
							</Panel>
						</>
					)}
				</Group>
			</Panel>
			{outputOpen && (
				<>
					<PanelSeparator direction="vertical" label="Resize output panel" />
					<Panel id="output" defaultSize="180px" minSize="100px" maxSize="60%">
						<OutputPanel />
					</Panel>
				</>
			)}
		</Group>
	);
}

interface PanelSeparatorProps {
	direction?: "horizontal" | "vertical";
	label: string;
}

function PanelSeparator({
	direction = "horizontal",
	label,
}: PanelSeparatorProps) {
	return (
		<Separator
			aria-label={label}
			className={cn(
				"focus-visible:bg-ui-accent",
				direction === "vertical" ? "h-1" : "w-1",
			)}
		/>
	);
}
