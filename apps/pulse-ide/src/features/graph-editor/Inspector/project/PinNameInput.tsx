import { TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import type { BoardPin } from "../../../project/project.types";
import { useGraphStore } from "../../graph.store";

export default function PinNameInput({ pin }: { pin: BoardPin }) {
	const name = pin.name ?? "";
	const [draft, setDraft] = useState(name);
	const mutate = useGraphStore((state) => state.mutate);
	useEffect(() => setDraft(name), [name]);

	return (
		<TextField.Root
			size="1"
			aria-label={`${pin.label} name`}
			placeholder="Optional name"
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={() => {
				const value = draft.trim();
				setDraft(value);
				if (value !== name)
					void mutate({ type: "setPinName", pin: pin.number, name: value });
			}}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
				if (event.key === "Escape") {
					setDraft(name);
					event.stopPropagation();
				}
			}}
		/>
	);
}
