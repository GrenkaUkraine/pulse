import { TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";

export default function LabelInput({
	value,
	onCommit,
}: {
	value: string;
	onCommit: (value: string) => void;
}) {
	const [draft, setDraft] = useState(value);
	useEffect(() => setDraft(value), [value]);
	return (
		<TextField.Root
			size="1"
			aria-label="Label"
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={() => {
				if (draft !== value) onCommit(draft);
				if (!draft.trim()) setDraft(value);
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
				if (event.key === "Escape") {
					setDraft(value);
					event.stopPropagation();
				}
			}}
		/>
	);
}
