import { TextField } from "@radix-ui/themes";
import { useEffect, useState } from "react";

interface NumberControlProps {
	value: number;
	label: string;
	integer: boolean;
	onChange: (value: number) => void;
}

export default function NumberControl({
	value,
	label,
	integer,
	onChange,
}: NumberControlProps) {
	const [draft, setDraft] = useState(String(value));
	useEffect(() => setDraft(String(value)), [value]);

	function commit() {
		const parsed = Number(draft);
		if (
			draft.trim() !== "" &&
			Number.isFinite(parsed) &&
			(!integer || Number.isSafeInteger(parsed))
		) {
			onChange(parsed);
			setDraft(String(parsed));
		} else {
			setDraft(String(value));
		}
	}

	return (
		<TextField.Root
			size="1"
			aria-label={label}
			className="w-20"
			inputMode={integer ? "numeric" : "decimal"}
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={commit}
			onKeyDown={(event) => {
				if (event.key === "Enter") event.currentTarget.blur();
				if (event.key === "Escape") {
					setDraft(String(value));
					event.stopPropagation();
				}
			}}
		/>
	);
}
