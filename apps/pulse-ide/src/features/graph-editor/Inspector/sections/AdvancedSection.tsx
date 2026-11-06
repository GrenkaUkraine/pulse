import type { NodeDefinition } from "../../node.types";
import type { PulseNodeType } from "../../PulseNode";
import InspectorSection from "../InspectorSection";
import PropertyRow from "../PropertyRow";

interface AdvancedSectionProps {
	node: PulseNodeType;
	definition: NodeDefinition;
	forceOpen: boolean;
}
export default function AdvancedSection({
	node,
	definition,
	forceOpen,
}: AdvancedSectionProps) {
	return (
		<InspectorSection title="Advanced" forceOpen={forceOpen}>
			<PropertyRow title="ID">
				<span className="break-all text-[10px] text-ui-muted select-text">
					{node.id}
				</span>
			</PropertyRow>
			<PropertyRow title="Type">
				<span className="break-all text-xs">{node.data.typeId}</span>
			</PropertyRow>
			<PropertyRow title="Category">
				<span className="text-xs">{definition.category.title}</span>
			</PropertyRow>
			<PropertyRow title="Position">
				<span className="text-xs tabular-nums">
					{Math.round(node.position.x)}, {Math.round(node.position.y)}
				</span>
			</PropertyRow>
		</InspectorSection>
	);
}
