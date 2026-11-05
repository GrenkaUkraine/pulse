import BooleanControl from "./controls/BooleanControl";
import NumberControl from "./controls/NumberControl";
import PinControl, { type PinOption } from "./controls/PinControl";
import StringControl from "./controls/StringControl";
import type { NodePinDefinition, PinValue } from "./node.types";

interface NodePinControlProps {
	pin: NodePinDefinition;
	value: PinValue | undefined;
	pinOptions: PinOption[];
	onChange: (value: PinValue) => void;
}

export default function NodePinControl({
	pin,
	value,
	pinOptions,
	onChange,
}: NodePinControlProps) {
	const label = pin.title ?? pin.id;
	if (pin.dataType === "execution") return null;
	if (pin.dataType === "pin" || pin.control === "pin") {
		if (pinOptions.length === 0) {
			return (
				<NumberControl
					label={label}
					integer
					value={typeof value === "number" ? value : 0}
					onChange={onChange}
				/>
			);
		}
		return (
			<PinControl
				label={label}
				value={typeof value === "number" ? value : undefined}
				options={pinOptions}
				onChange={onChange}
			/>
		);
	}
	switch (pin.dataType) {
		case "boolean":
			return (
				<BooleanControl
					label={label}
					value={typeof value === "boolean" ? value : false}
					onChange={onChange}
				/>
			);
		case "int":
		case "float":
			return (
				<NumberControl
					label={label}
					integer={pin.dataType === "int"}
					value={typeof value === "number" ? value : 0}
					onChange={onChange}
				/>
			);
		case "string":
			return (
				<StringControl
					label={label}
					value={typeof value === "string" ? value : ""}
					onChange={onChange}
				/>
			);
	}
}
