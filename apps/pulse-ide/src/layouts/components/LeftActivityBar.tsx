import { WalletIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import {
	WalletIcon as WalletIconFilled,
	WrenchScrewdriverIcon as WrenchScrewdriverIconFilled,
} from "@heroicons/react/24/solid";
import { ToolbarButton } from "../../shared/ui/ToolbarButton.tsx";
import { ToolbarGroup } from "../../shared/ui/ToolbarGroup.tsx";

export default function LeftActivityBar() {
	return (
		<div className="flex flex-col justify-between">
			<ToolbarGroup direction="vertical" className="py-0">
				<ToolbarButton
					icon={WalletIcon}
					activeIcon={WalletIconFilled}
					aria-label="Nodes"
					active
				/>
			</ToolbarGroup>
			<ToolbarGroup direction="vertical" className="py-0">
				<ToolbarButton
					icon={WrenchScrewdriverIcon}
					activeIcon={WrenchScrewdriverIconFilled}
					aria-label="Output"
					active
				/>
			</ToolbarGroup>
		</div>
	);
}
