import { create } from "zustand";
import type { NodeDefinition } from "../graph-editor/node.types";
import { getNodeCatalog } from "./catalog.api";

interface CatalogState {
	definitions: NodeDefinition[];
	status: "idle" | "loading" | "ready" | "error";
	error: string | null;
	loadCatalog: () => Promise<void>;
}

let loading: Promise<void> | undefined;

export const useCatalogStore = create<CatalogState>((set, get) => ({
	definitions: [],
	status: "idle",
	error: null,
	loadCatalog() {
		if (get().status === "ready") return Promise.resolve();
		if (loading) return loading;
		set({ status: "loading", error: null });
		loading = getNodeCatalog()
			.then((definitions) => {
				set({ definitions, status: "ready" });
			})
			.catch((reason: unknown) => {
				console.error("Failed to load catalog:", reason);
				set({ error: String(reason), status: "error" });
			})
			.finally(() => {
				loading = undefined;
			});
		return loading;
	},
}));
