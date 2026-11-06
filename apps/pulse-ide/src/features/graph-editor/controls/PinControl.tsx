import { Select } from "@radix-ui/themes";

export interface PinOption {
	value: number;
	label: string;
}

interface PinControlProps {
	value: number | undefined;
	label: string;
	options: PinOption[];
	onChange: (value: number) => void;
}

export default function PinControl({
	value,
	label,
	options,
	onChange,
}: PinControlProps) {
	const selected = options.find((option) => option.value === value);
	return (
		<Select.Root
			size="1"
			value={selected ? String(selected.value) : ""}
			onValueChange={(next) => onChange(Number(next))}
		>
			<Select.Trigger
				aria-label={label}
				disabled={options.length === 0}
				placeholder={options.length === 0 ? "No declared pins" : "Select pin"}
			>
				{selected?.label ??
					(value === undefined ? undefined : `Pin ${value} · Unavailable`)}
			</Select.Trigger>
			<Select.Content>
				{options.map((option) => (
					<Select.Item key={option.value} value={String(option.value)}>
						{option.label}
					</Select.Item>
				))}
			</Select.Content>
		</Select.Root>
	);
}
