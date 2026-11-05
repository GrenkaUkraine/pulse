import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { AdjustmentsHorizontalIcon as AdjustmentsHorizontalIconFilled } from "@heroicons/react/24/solid";
import { ToolbarButton } from "../../shared/ui/ToolbarButton.tsx";
import { ToolbarGroup } from "../../shared/ui/ToolbarGroup.tsx";

interface RightActivityBarProps {
	inspectorOpen: boolean;
	onToggleInspector: () => void;
}

export default function RightActivityBar({
	inspectorOpen,
	onToggleInspector,
}: RightActivityBarProps) {
	return (
		<div className="flex flex-col justify-between">
			<ToolbarGroup direction="vertical" className="py-0">
				<ToolbarButton
					icon={AdjustmentsHorizontalIcon}
					activeIcon={AdjustmentsHorizontalIconFilled}
					aria-label="Inspector"
					active={inspectorOpen}
					onClick={onToggleInspector}
				/>
			</ToolbarGroup>
			<ToolbarGroup direction="vertical" className="py-0"></ToolbarGroup>
		</div>
	);
}
