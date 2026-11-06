import { Text } from "@radix-ui/themes";
import PanelContainer from "../../../shared/ui/PanelContainer";
import { useGraphStore } from "../graph.store";
import NodeInspector from "./node/NodeInspector";
import ProjectInspector from "./project/ProjectInspector";

export default function Inspector() {
	const nodes = useGraphStore((state) => state.nodes);
	const selected = nodes.filter((node) => node.selected);
	if (selected.length === 0) return <ProjectInspector />;
	if (selected.length === 1)
		return <NodeInspector key={selected[0].id} node={selected[0]} />;
	return (
		<PanelContainer title="Inspector">
			<Text size="1" className="text-ui-muted">
				{selected.length} nodes selected
			</Text>
		</PanelContainer>
	);
}
