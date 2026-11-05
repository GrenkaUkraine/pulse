import { Checkbox } from "@radix-ui/themes";

interface BooleanControlProps {
	value: boolean;
	label: string;
	onChange: (value: boolean) => void;
}

export default function BooleanControl({
	value,
	label,
	onChange,
}: BooleanControlProps) {
	return (
		<Checkbox
			aria-label={label}
			checked={value}
			onCheckedChange={(checked) => onChange(checked === true)}
		/>
	);
}
