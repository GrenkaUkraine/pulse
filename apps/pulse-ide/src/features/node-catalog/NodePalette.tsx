import {
	ArrowPathIcon,
	ArrowRightStartOnRectangleIcon,
	ArrowsRightLeftIcon,
	BoltIcon,
	ChevronRightIcon,
	ClockIcon,
	CodeBracketIcon,
	MagnifyingGlassIcon,
	NumberedListIcon,
	VariableIcon,
} from "@heroicons/react/24/outline";
import { ScrollArea, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { cn } from "../../shared/lib/cn";
import PanelContainer from "../../shared/ui/PanelContainer";

const categories = [
	{
		title: "Flow",
		nodes: [
			{
				id: "flow.setup",
				title: "On Setup",
				description: "Run once on startup",
				icon: BoltIcon,
				color: "text-pin-boolean",
			},
			{
				id: "flow.loop",
				title: "On Loop",
				description: "Repeat continuously",
				icon: ArrowPathIcon,
				color: "text-pin-boolean",
			},
			{
				id: "flow.branch",
				title: "Branch",
				description: "Choose a path",
				icon: ArrowsRightLeftIcon,
				color: "text-orange-400",
			},
			{
				id: "flow.delay",
				title: "Delay",
				description: "Pause execution",
				icon: ClockIcon,
				color: "text-pin-int",
			},
		],
	},
	{
		title: "GPIO",
		nodes: [
			{
				id: "gpio.digital_write",
				title: "Digital Write",
				description: "Set a digital output",
				icon: ArrowRightStartOnRectangleIcon,
				color: "text-pin-int",
			},
			{
				id: "gpio.digital_read",
				title: "Digital Read",
				description: "Read a digital input",
				icon: ArrowRightStartOnRectangleIcon,
				color: "text-pin-int",
			},
		],
	},
	{
		title: "Values",
		nodes: [
			{
				id: "value.bool",
				title: "Boolean",
				description: "True or false",
				icon: VariableIcon,
				color: "text-green-400",
			},
			{
				id: "value.int",
				title: "Integer",
				description: "A whole number",
				icon: NumberedListIcon,
				color: "text-green-400",
			},
		],
	},
	{
		title: "Logic",
		nodes: [
			{
				id: "logic.not",
				title: "NOT",
				description: "Invert a boolean",
				icon: CodeBracketIcon,
				color: "text-pin-pin",
			},
			{
				id: "logic.equal_int",
				title: "Equal (Integer)",
				description: "Compare two integers",
				icon: CodeBracketIcon,
				color: "text-pin-pin",
			},
		],
	},
];

export default function NodePalette() {
	const [query, setQuery] = useState("");
	const [collapsed, setCollapsed] = useState<string[]>([]);
	const search = query.trim().toLowerCase();
	const filtered = categories
		.map((category) => ({
			...category,
			nodes: category.nodes.filter((node) =>
				[category.title, node.title, node.id]
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
				{filtered.map((category) => (
					<PaletteCategory
						key={category.title}
						category={category}
						expanded={search !== "" || !collapsed.includes(category.title)}
						onToggle={() => toggleCategory(category.title)}
					/>
				))}
				{count === 0 && (
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

type PaletteCategoryDefinition = (typeof categories)[number];
type PaletteNodeDefinition = PaletteCategoryDefinition["nodes"][number];

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

interface PaletteNodeItemProps {
	node: PaletteNodeDefinition;
}

function PaletteNodeItem({ node }: PaletteNodeItemProps) {
	return (
		<div
			title={node.id}
			className="group flex items-center gap-ui-2 rounded-ui-2 px-ui-2 py-ui-2 hover:bg-ui-gray-4 hover:cursor-grab select-none"
		>
			<node.icon
				aria-hidden="true"
				className={cn("size-4 shrink-0", node.color)}
			/>
			<div className="min-w-0">
				<div className="truncate text-xs text-ui-foreground">{node.title}</div>
				<div className="truncate text-[10px] text-ui-muted">
					{node.description}
				</div>
			</div>
		</div>
	);
}
