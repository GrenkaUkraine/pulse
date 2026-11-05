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
	return (
		<Select.Root
			size="1"
			value={value === undefined ? "" : String(value)}
			onValueChange={(next) => onChange(Number(next))}
		>
			<Select.Trigger aria-label={label} placeholder="Select pin" />
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
