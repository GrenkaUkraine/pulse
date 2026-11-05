type DataPinType = "boolean" | "int" | "float" | "string" | "pin";
export type PinType = "execution" | DataPinType;

interface PinBase {
	id: string;
	title?: string;
}

export type NodePinDefinition =
	| (PinBase & {
			direction: "input" | "output";
			dataType: "execution";
	  })
	| (PinBase & {
			direction: "input";
			dataType: DataPinType;
			showControl?: boolean;
	  })
	| (PinBase & {
			direction: "output";
			dataType: DataPinType;
	  });
