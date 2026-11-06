import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Text, TextField } from "@radix-ui/themes";
import { useState } from "react";
import PanelContainer from "../../../shared/ui/PanelContainer";
import { useCatalogStore } from "../../node-catalog/catalog.store";
import PaletteNodeItem from "../../node-catalog/PaletteNodeItem";
import { useGraphStore } from "../graph.store";
import InspectorContent from "./InspectorContent";

export default function NodeInspector() {
	const nodes = useGraphStore((state) => state.nodes);
	const definitions = useCatalogStore((state) => state.definitions);
	const [query, setQuery] = useState("");
	const selectedNodes = nodes.filter((node) => node.selected);

	if (selectedNodes.length !== 1) {
		return (
			<PanelContainer title="Inspector">
				<Text size="1" className="text-ui-muted">
					{selectedNodes.length === 0
						? "Select a node"
						: `${selectedNodes.length} nodes selected`}
				</Text>
			</PanelContainer>
		);
	}

	const node = selectedNodes[0];
	const definition = definitions.find((item) => item.id === node.data.typeId);

	return (
		<PanelContainer title="Inspector" className="min-h-0">
			<TextField.Root
				size="1"
				placeholder="Search..."
				aria-label="Search properties"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			>
				<TextField.Slot>
					<MagnifyingGlassIcon aria-hidden="true" className="size-3.5" />
				</TextField.Slot>
			</TextField.Root>
			{definition && <PaletteNodeItem node={definition} interactive={false} />}
			{definition && (
				<InspectorContent
					key={node.id}
					node={node}
					definition={definition}
					query={query}
				/>
			)}
		</PanelContainer>
	);
}
