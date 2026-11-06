import { Checkbox } from "@radix-ui/themes";
import { useGraphStore } from "../../../graph.store";
import type { PulseNodeType } from "../../../PulseNode";
import InspectorSection from "../../shared/InspectorSection";
import LabelInput from "../../shared/LabelInput";
import PropertyRow from "../../shared/PropertyRow";

interface GeneralSectionProps {
	node: PulseNodeType;
	showLabel: boolean;
	showEnabled: boolean;
	forceOpen: boolean;
}
export default function GeneralSection({
	node,
	showLabel,
	showEnabled,
	forceOpen,
}: GeneralSectionProps) {
	const mutate = useGraphStore((state) => state.mutate);
	return (
		<InspectorSection title="General" defaultOpen forceOpen={forceOpen}>
			{showLabel && (
				<PropertyRow title="Label">
					<LabelInput
						key={node.id}
						value={node.data.title}
						onCommit={(label) =>
							void mutate({ type: "setLabel", nodeId: node.id, label })
						}
					/>
				</PropertyRow>
			)}
			{showEnabled && (
				<PropertyRow title="Enabled">
					<div className="flex justify-end">
						<Checkbox
							aria-label="Enabled"
							checked={node.data.enabled}
							onCheckedChange={(checked) =>
								void mutate({
									type: "setEnabled",
									nodeId: node.id,
									enabled: checked === true,
								})
							}
						/>
					</div>
				</PropertyRow>
			)}
		</InspectorSection>
	);
}
