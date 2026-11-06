import type { Edge } from "@xyflow/react";
import { useGraphStore } from "../../../graph.store";
import NodePinControl from "../../../NodePinControl";
import type { NodePinDefinition } from "../../../node.types";
import type { PulseNodeType } from "../../../PulseNode";
import EmptyMessage from "../../shared/EmptyMessage";
import InspectorSection from "../../shared/InspectorSection";
import PropertyRow from "../../shared/PropertyRow";

interface ParametersSectionProps {
	node: PulseNodeType;
	parameters: NodePinDefinition[];
	edges: Edge[];
	forceOpen: boolean;
}
export default function ParametersSection({
	node,
	parameters,
	edges,
	forceOpen,
}: ParametersSectionProps) {
	const mutate = useGraphStore((state) => state.mutate);
	return (
		<InspectorSection title="Parameters" defaultOpen forceOpen={forceOpen}>
			{parameters.length === 0 && (
				<EmptyMessage>No editable parameters</EmptyMessage>
			)}
			{parameters.map((pin) => {
				const connected =
					pin.direction === "input" &&
					edges.some(
						(edge) => edge.target === node.id && edge.targetHandle === pin.id,
					);
				return (
					<PropertyRow key={pin.id} title={pin.title ?? pin.id}>
						{connected ? (
							<span className="text-xs text-ui-muted">Connected</span>
						) : (
							<div className="flex min-w-0 justify-end [&_.rt-TextFieldRoot]:w-full [&_.rt-SelectTrigger]:w-full">
								<NodePinControl
									pin={pin}
									value={node.data.values?.[pin.id]}
									pinOptions={node.data.pinOptions ?? []}
									onChange={(value) =>
										void mutate({
											type: "setValue",
											nodeId: node.id,
											portId: pin.id,
											value,
										})
									}
								/>
							</div>
						)}
					</PropertyRow>
				);
			})}
		</InspectorSection>
	);
}
