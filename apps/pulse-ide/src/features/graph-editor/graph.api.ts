import { invoke } from "@tauri-apps/api/core";
import type { NodeInstance, PinValue } from "./node.types";

export interface GraphConnection {
	id: string;
	source: string;
	sourceHandle: string;
	target: string;
	targetHandle: string;
}

export interface GraphSnapshot {
	nodes: NodeInstance[];
	edges: GraphConnection[];
	canUndo: boolean;
	canRedo: boolean;
}

export type GraphAction =
	| { type: "undo" }
	| { type: "redo" }
	| { type: "createNode"; typeId: string; position: NodeInstance["position"] }
	| { type: "moveNodes"; nodes: Pick<NodeInstance, "id" | "position">[] }
	| { type: "setValue"; nodeId: string; portId: string; value: PinValue }
	| { type: "deleteElements"; nodeIds: string[]; edgeIds: string[] }
	| {
			type: "connect";
			source: string;
			sourceHandle: string;
			target: string;
			targetHandle: string;
	  }
	| { type: "disconnect"; edgeId: string };

export function getGraph(): Promise<GraphSnapshot> {
	return invoke("get_graph");
}

export function applyGraphAction(action: GraphAction): Promise<GraphSnapshot> {
	return invoke("apply_graph_action", { action });
}
