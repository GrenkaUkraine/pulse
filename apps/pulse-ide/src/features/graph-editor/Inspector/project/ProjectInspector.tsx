import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { ScrollArea, TextField } from "@radix-ui/themes";
import { useState } from "react";
import PanelContainer from "../../../../shared/ui/PanelContainer";
import { useGraphStore } from "../../graph.store";
import EmptyMessage from "../shared/EmptyMessage";
import PinSettingsSection from "./PinSettingsSection";
import ProjectGeneralSection from "./ProjectGeneralSection";
import VariablesSection from "./VariablesSection";

export default function ProjectInspector() {
	const project = useGraphStore((state) => state.project);
	const [query, setQuery] = useState("");
	const search = query.trim().toLowerCase();
	return (
		<PanelContainer title="Project" className="min-h-0">
			<TextField.Root
				size="1"
				placeholder="Search..."
				aria-label="Search project settings"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			>
				<TextField.Slot>
					<MagnifyingGlassIcon aria-hidden="true" className="size-3.5" />
				</TextField.Slot>
			</TextField.Root>
			{project && (
				<ScrollArea
					type="auto"
					scrollbars="vertical"
					className="min-h-0 flex-1"
				>
					<ProjectGeneralSection project={project} search={search} />
					<PinSettingsSection pins={project.pins} search={search} />
					<VariablesSection search={search} />
				</ScrollArea>
			)}
			{!project && <EmptyMessage>Loading project...</EmptyMessage>}
		</PanelContainer>
	);
}
