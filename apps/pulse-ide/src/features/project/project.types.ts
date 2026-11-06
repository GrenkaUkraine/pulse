export type PinMode = "unused" | "input" | "output" | "inputPullup";

export interface BoardPin {
	number: number;
	label: string;
	name: string | null;
	mode: PinMode;
}

export interface ProjectSettings {
	name: string;
	description: string;
	boardId: string;
	boardName: string;
	pins: BoardPin[];
}

export const pinModeLabels: Record<PinMode, string> = {
	unused: "Unused",
	input: "Input",
	output: "Output",
	inputPullup: "Input Pull-up",
};
