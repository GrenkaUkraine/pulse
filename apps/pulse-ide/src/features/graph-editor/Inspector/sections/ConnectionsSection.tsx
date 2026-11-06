import {
	ArrowRightEndOnRectangleIcon,
	ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import type { Edge } from "@xyflow/react";
import type { PulseNodeType } from "../../PulseNode";
import EmptyMessage from "../EmptyMessage";
import InspectorSection from "../InspectorSection";

interface ConnectionsSectionProps {
	node: PulseNodeType;
	nodes: PulseNodeType[];
	connections: Edge[];
	forceOpen: boolean;
}
export default function ConnectionsSection({
	node,
	nodes,
	connections,
	forceOpen,
}: ConnectionsSectionProps) {
	return (
		<InspectorSection
			title="Connections"
			count={connections.length}
			forceOpen={forceOpen}
		>
			{connections.length === 0 && <EmptyMessage>No connections</EmptyMessage>}
			{connections.map((edge) => {
				const incoming = edge.target === node.id;
				const other = nodes.find(
					(item) => item.id === (incoming ? edge.source : edge.target),
				);
				return (
					<div key={edge.id} className="min-w-0 text-xs">
						<div className="flex min-w-0 items-center gap-ui-1">
							{incoming ? (
								<ArrowRightEndOnRectangleIcon
									aria-hidden="true"
									className="size-4 shrink-0"
								/>
							) : (
								<ArrowRightStartOnRectangleIcon
									aria-hidden="true"
									className="size-4 shrink-0"
								/>
							)}
							<span className="truncate">{other?.data.title ?? "Node"}</span>
						</div>
						<div className="mt-ui-1 break-words text-[10px] text-ui-muted">
							{edge.sourceHandle} → {edge.targetHandle}
						</div>
					</div>
				);
			})}
		</InspectorSection>
	);
}
