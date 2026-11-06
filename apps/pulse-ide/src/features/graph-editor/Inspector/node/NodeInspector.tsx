import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TextField } from "@radix-ui/themes";
import { useState } from "react";
import PanelContainer from "../../../../shared/ui/PanelContainer";
import { useCatalogStore } from "../../../node-catalog/catalog.store";
import PaletteNodeItem from "../../../node-catalog/PaletteNodeItem";
import type { PulseNodeType } from "../../PulseNode";
import InspectorContent from "./InspectorContent";

export default function NodeInspector({ node }: { node: PulseNodeType }) {
	const definitions = useCatalogStore((state) => state.definitions);
	const [query, setQuery] = useState("");
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
				<InspectorContent node={node} definition={definition} query={query} />
			)}
		</PanelContainer>
	);
}
