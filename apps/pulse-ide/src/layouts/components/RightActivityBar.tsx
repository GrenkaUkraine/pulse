import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { AdjustmentsHorizontalIcon as AdjustmentsHorizontalIconFilled } from "@heroicons/react/24/solid";
import { ToolbarButton } from "../../shared/ui/ToolbarButton.tsx";
import { ToolbarGroup } from "../../shared/ui/ToolbarGroup.tsx";

export default function RightActivityBar() {
	return (
		<div className="flex flex-col justify-between">
			<ToolbarGroup direction="vertical">
				<ToolbarButton
					icon={AdjustmentsHorizontalIcon}
					activeIcon={AdjustmentsHorizontalIconFilled}
					aria-label="Inspector"
					active
				/>
			</ToolbarGroup>
			<ToolbarGroup direction="vertical"></ToolbarGroup>
		</div>
	);
}
