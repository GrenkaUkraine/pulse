import { ScrollArea } from "@radix-ui/themes";
import { useGraphStore } from "../../graph.store";
import type { NodeDefinition } from "../../node.types";
import type { PulseNodeType } from "../../PulseNode";
import EmptyMessage from "../shared/EmptyMessage";
import AdvancedSection from "./sections/AdvancedSection";
import ConnectionsSection from "./sections/ConnectionsSection";
import GeneralSection from "./sections/GeneralSection";
import ParametersSection from "./sections/ParametersSection";

interface InspectorContentProps {
	node: PulseNodeType;
	definition: NodeDefinition;
	query: string;
}

export default function InspectorContent({
	node,
	definition,
	query,
}: InspectorContentProps) {
	const nodes = useGraphStore((state) => state.nodes);
	const edges = useGraphStore((state) => state.edges);

	const search = query.trim().toLowerCase();
	const matches = (...values: string[]) =>
		values.join(" ").toLowerCase().includes(search);
	const parameters = definition.pins.filter(
		(pin) =>
			pin.dataType !== "execution" &&
			(pin.direction === "input" || pin.showControl === true) &&
			matches("Parameters", pin.title ?? pin.id, pin.dataType),
	);
	const connections = edges.filter(
		(edge) =>
			(edge.source === node.id || edge.target === node.id) &&
			matches(
				"Connections",
				edge.sourceHandle ?? "",
				edge.targetHandle ?? "",
				nodes.find((item) => item.id === edge.source)?.data.title ?? "",
				nodes.find((item) => item.id === edge.target)?.data.title ?? "",
			),
	);
	const showLabel = matches("General", "Label", node.data.title);
	const showEnabled = matches("General", "Enabled");
	const showAdvanced = matches(
		"Advanced",
		"ID",
		"Type",
		"Category",
		"Position",
		node.id,
		node.data.typeId,
		definition.category.title,
	);

	return (
		<ScrollArea type="auto" scrollbars="vertical" className="min-h-0 flex-1">
			{(showLabel || showEnabled) && (
				<GeneralSection
					node={node}
					showLabel={showLabel}
					showEnabled={showEnabled}
					forceOpen={search !== ""}
				/>
			)}

			{(parameters.length > 0 || search === "") && (
				<ParametersSection
					node={node}
					parameters={parameters}
					edges={edges}
					forceOpen={search !== ""}
				/>
			)}

			{(connections.length > 0 || search === "") && (
				<ConnectionsSection
					node={node}
					nodes={nodes}
					connections={connections}
					forceOpen={search !== ""}
				/>
			)}

			{showAdvanced && (
				<AdvancedSection
					node={node}
					definition={definition}
					forceOpen={search !== ""}
				/>
			)}
			{!showLabel &&
				!showEnabled &&
				!showAdvanced &&
				parameters.length === 0 &&
				connections.length === 0 && (
					<EmptyMessage>No properties found</EmptyMessage>
				)}
		</ScrollArea>
	);
}
