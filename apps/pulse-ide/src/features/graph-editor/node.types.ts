export type DataPinType = "boolean" | "int" | "float" | "string";
export type PinType = "execution" | DataPinType;
export type PinControlKind =
	| "checkbox"
	| "integer"
	| "decimal"
	| "text"
	| "pin";
export type PinValue = boolean | number | string;

interface PinBase {
	id: string;
	title?: string;
	direction: "input" | "output";
	maxConnections?: number | null;
}

export type NodePinDefinition =
	| (PinBase & {
			dataType: "execution";
	  })
	| (PinBase & {
			dataType: DataPinType;
			defaultValue?: PinValue;
			control?: PinControlKind;
			showControl?: boolean;
	  });

export type NodeKind = "event" | "action" | "flow" | "value" | "logic";

export interface NodeDefinition {
	id: string;
	title: string;
	description: string;
	icon: string;
	kind: NodeKind;
	category: { id: string; title: string };
	pins: NodePinDefinition[];
}
