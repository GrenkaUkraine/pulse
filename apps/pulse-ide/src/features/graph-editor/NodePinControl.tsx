import BooleanControl from "./controls/BooleanControl";
import NumberControl from "./controls/NumberControl";
import PinControl, { type PinOption } from "./controls/PinControl";
import StringControl from "./controls/StringControl";
import type { NodePinDefinition } from "./node.types";

export type PinValue = boolean | number | string;

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
	switch (pin.dataType) {
		case "execution":
			return null;
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
		case "pin":
			return (
				<PinControl
					label={label}
					value={typeof value === "number" ? value : undefined}
					options={pinOptions}
					onChange={onChange}
				/>
			);
	}
}
