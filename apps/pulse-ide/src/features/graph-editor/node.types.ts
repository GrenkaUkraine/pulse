type DataPinType = "boolean" | "int" | "float" | "string" | "pin";
export type PinType = "execution" | DataPinType;

interface PinBase {
	id: string;
	title?: string;
}

export type NodePinDefinition =
	| (PinBase & {
			direction: "output";
			dataType: "execution";
	  })
	| (PinBase & {
			direction: "input";
			maxConnections?: number;
			dataType: "execution";
	  })
	| (PinBase & {
			direction: "input";
			dataType: DataPinType;
			showControl?: boolean;
			maxConnections?: number;
	  })
	| (PinBase & {
			direction: "output";
			dataType: DataPinType;
	  });

export type NodeKind = "event" | "action" | "flow" | "value" | "logic";
