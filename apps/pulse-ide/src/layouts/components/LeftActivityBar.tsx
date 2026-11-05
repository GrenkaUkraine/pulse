import { WalletIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import {
	WalletIcon as WalletIconFilled,
	WrenchScrewdriverIcon as WrenchScrewdriverIconFilled,
} from "@heroicons/react/24/solid";
import { ToolbarButton } from "../../shared/ui/ToolbarButton.tsx";
import { ToolbarGroup } from "../../shared/ui/ToolbarGroup.tsx";

interface LeftActivityBarProps {
	nodesOpen: boolean;
	outputOpen: boolean;
	onToggleNodes: () => void;
	onToggleOutput: () => void;
}

export default function LeftActivityBar({
	nodesOpen,
	outputOpen,
	onToggleNodes,
	onToggleOutput,
}: LeftActivityBarProps) {
	return (
		<div className="flex flex-col justify-between">
			<ToolbarGroup direction="vertical" className="py-0">
				<ToolbarButton
					icon={WalletIcon}
					activeIcon={WalletIconFilled}
					aria-label="Nodes"
					active={nodesOpen}
					onClick={onToggleNodes}
				/>
			</ToolbarGroup>
			<ToolbarGroup direction="vertical" className="py-0">
				<ToolbarButton
					icon={WrenchScrewdriverIcon}
					activeIcon={WrenchScrewdriverIconFilled}
					aria-label="Output"
					active={outputOpen}
					onClick={onToggleOutput}
				/>
			</ToolbarGroup>
		</div>
	);
}
