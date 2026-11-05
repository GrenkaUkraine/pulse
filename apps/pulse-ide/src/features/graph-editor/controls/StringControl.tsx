import { TextField } from "@radix-ui/themes";

interface StringControlProps {
	value: string;
	label: string;
	onChange: (value: string) => void;
}

export default function StringControl({
	value,
	label,
	onChange,
}: StringControlProps) {
	return (
		<TextField.Root
			size="1"
			aria-label={label}
			className="w-40"
			value={value}
			onChange={(event) => onChange(event.target.value)}
		/>
	);
}
