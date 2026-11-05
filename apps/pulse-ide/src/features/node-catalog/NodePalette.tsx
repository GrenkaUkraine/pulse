import {
	ChevronRightIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { ScrollArea, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { cn } from "../../shared/lib/cn";
import PanelContainer from "../../shared/ui/PanelContainer";
import type { NodeDefinition } from "../graph-editor/node.types";
import { useCatalogStore } from "./catalog.store";
import PaletteNodeItem from "./PaletteNodeItem";

export default function NodePalette() {
	const catalog = useCatalogStore((state) => state.definitions);
	const status = useCatalogStore((state) => state.status);
	const error = useCatalogStore((state) => state.error);
	const loadCatalog = useCatalogStore((state) => state.loadCatalog);
	const loading = status === "idle" || status === "loading";
	const categories: PaletteCategoryDefinition[] = [];
	for (const node of catalog) {
		let category = categories.find((item) => item.id === node.category.id);
		if (!category) {
			category = {
				id: node.category.id,
				title: node.category.title,
				nodes: [],
			};
			categories.push(category);
		}
		category.nodes.push(node);
	}
	const [query, setQuery] = useState("");
	const [collapsed, setCollapsed] = useState<string[]>([]);
	const search = query.trim().toLowerCase();
	const filtered = categories
		.map((category) => ({
			...category,
			nodes: category.nodes.filter((node) =>
				[category.title, node.title, node.description, node.id]
					.join(" ")
					.toLowerCase()
					.includes(search),
			),
		}))
		.filter((category) => category.nodes.length > 0);
	const count = filtered.reduce(
		(total, category) => total + category.nodes.length,
		0,
	);

	function toggleCategory(title: string) {
		setCollapsed((current) =>
			current.includes(title)
				? current.filter((item) => item !== title)
				: [...current, title],
		);
	}

	return (
		<PanelContainer title="Nodes" className="min-h-0">
			<TextField.Root
				size="1"
				placeholder="Search nodes..."
				aria-label="Search nodes"
				value={query}
				onChange={(event) => setQuery(event.target.value)}
			>
				<TextField.Slot>
					<MagnifyingGlassIcon aria-hidden="true" className="size-3.5" />
				</TextField.Slot>
			</TextField.Root>

			<ScrollArea
				type="always"
				scrollbars="vertical"
				className="min-h-0 flex-1 pr-ui-4"
			>
				{loading && (
					<p className="py-ui-3 text-xs text-ui-muted" role="status">
						Loading nodes...
					</p>
				)}
				{error && (
					<div className="py-ui-3 text-xs" role="alert">
						<p>Could not load the node catalog.</p>
						<p className="mt-ui-1 break-words text-ui-muted">{error}</p>
						<button
							type="button"
							className="mt-ui-2 text-ui-accent"
							onClick={() => void loadCatalog()}
						>
							Retry
						</button>
					</div>
				)}
				{!loading &&
					!error &&
					filtered.map((category) => (
						<PaletteCategory
							key={category.id}
							category={category}
							expanded={search !== "" || !collapsed.includes(category.id)}
							onToggle={() => toggleCategory(category.id)}
						/>
					))}
				{!loading && !error && count === 0 && (
					<p className="py-ui-3 text-center text-xs text-ui-muted">
						No nodes found
					</p>
				)}
			</ScrollArea>

			<div className="border-t border-ui-border pt-ui-2 text-[10px] text-ui-muted">
				{count} nodes
			</div>
		</PanelContainer>
	);
}

interface PaletteCategoryDefinition {
	id: string;
	title: string;
	nodes: NodeDefinition[];
}

interface PaletteCategoryProps {
	category: PaletteCategoryDefinition;
	expanded: boolean;
	onToggle: () => void;
}

function PaletteCategory({
	category,
	expanded,
	onToggle,
}: PaletteCategoryProps) {
	return (
		<section className="mb-ui-2">
			<button
				type="button"
				aria-expanded={expanded}
				onClick={() => onToggle()}
				className="flex w-full items-center gap-ui-1 rounded-ui-1 py-ui-2 text-xs text-ui-muted hover:text-ui-foreground"
			>
				<ChevronRightIcon
					aria-hidden="true"
					className={cn("size-3 transition-transform", expanded && "rotate-90")}
				/>
				<span>{category.title}</span>
				<span className="ml-auto text-[10px] tabular-nums">
					{category.nodes.length}
				</span>
			</button>
			{expanded && (
				<div className="flex flex-col gap-0.5">
					{category.nodes.map((node) => (
						<PaletteNodeItem key={node.id} node={node} />
					))}
				</div>
			)}
		</section>
	);
}
