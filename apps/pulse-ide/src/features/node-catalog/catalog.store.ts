import { create } from "zustand";
import type { NodeDefinition } from "../graph-editor/node.types";
import { getNodeCatalog } from "./catalog.api";

interface CatalogState {
	definitions: NodeDefinition[];
	status: "idle" | "loading" | "ready" | "error";
	error: string | null;
	loadCatalog: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
	definitions: [],
	status: "idle",
	error: null,
	async loadCatalog() {
		const { status } = get();
		if (status === "loading" || status === "ready") return;

		set({ status: "loading", error: null });
		try {
			const definitions = await getNodeCatalog();
			set({ definitions, status: "ready" });
		} catch (reason) {
			set({ error: String(reason), status: "error" });
		}
	},
}));
