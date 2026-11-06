import { TextArea } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import type { ProjectSettings } from "../../../project/project.types";
import { useGraphStore } from "../../graph.store";
import InspectorSection from "../shared/InspectorSection";
import LabelInput from "../shared/LabelInput";
import PropertyRow from "../shared/PropertyRow";

export default function ProjectGeneralSection({
	project,
	search,
}: {
	project: ProjectSettings;
	search: string;
}) {
	const mutate = useGraphStore((state) => state.mutate);
	const showName = ["general", "name", project.name.toLowerCase()].some(
		(value) => value.includes(search),
	);
	const showDescription = [
		"general",
		"description",
		project.description.toLowerCase(),
	].some((value) => value.includes(search));
	const showBoard = ["general", "board", project.boardName.toLowerCase()].some(
		(value) => value.includes(search),
	);
	if (!showName && !showDescription && !showBoard) return null;
	return (
		<InspectorSection title="General" defaultOpen forceOpen={search !== ""}>
			{showName && (
				<PropertyRow title="Name">
					<LabelInput
						value={project.name}
						onCommit={(name) => {
							if (name.trim()) void mutate({ type: "setProjectName", name });
						}}
					/>
				</PropertyRow>
			)}
			{showDescription && (
				<div className="flex flex-col gap-ui-2">
					<span className="text-xs text-ui-muted">Description</span>
					<DescriptionInput
						value={project.description}
						onCommit={(description) =>
							void mutate({ type: "setProjectDescription", description })
						}
					/>
				</div>
			)}
			{showBoard && (
				<PropertyRow title="Board">
					<span className="text-xs">{project.boardName}</span>
				</PropertyRow>
			)}
		</InspectorSection>
	);
}

function DescriptionInput({
	value,
	onCommit,
}: {
	value: string;
	onCommit: (value: string) => void;
}) {
	const [draft, setDraft] = useState(value);
	useEffect(() => setDraft(value), [value]);
	return (
		<TextArea
			size="1"
			rows={3}
			aria-label="Project description"
			placeholder="Describe your project..."
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={() => {
				if (draft !== value) onCommit(draft);
			}}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					setDraft(value);
					event.stopPropagation();
				}
			}}
		/>
	);
}
