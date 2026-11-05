import { invoke } from "@tauri-apps/api/core";
import type { NodeDefinition } from "../graph-editor/node.types";

export function getNodeCatalog(): Promise<NodeDefinition[]> {
	return invoke<NodeDefinition[]>("get_node_catalog");
}
