import {
	ArrowDownTrayIcon,
	ArrowPathIcon,
	ArrowsRightLeftIcon,
	ArrowUpTrayIcon,
	BoltIcon,
	CheckCircleIcon,
	ClockIcon,
	CubeIcon,
	EqualsIcon,
	HashtagIcon,
	NoSymbolIcon,
} from "@heroicons/react/24/outline";
import type { NodeKind } from "../../features/graph-editor/node.types";

const nodeIcons = new Map<string, typeof CubeIcon>([
	["bolt", BoltIcon],
	["arrow-path", ArrowPathIcon],
	["arrows-right-left", ArrowsRightLeftIcon],
	["clock", ClockIcon],
	["arrow-up-tray", ArrowUpTrayIcon],
	["arrow-down-tray", ArrowDownTrayIcon],
	["check-circle", CheckCircleIcon],
	["hashtag", HashtagIcon],
	["no-symbol", NoSymbolIcon],
	["equals", EqualsIcon],
]);

export function getNodeIcon(key: string | undefined): typeof CubeIcon {
	return nodeIcons.get(key ?? "") ?? CubeIcon;
}

export const nodeIconColors = {
	event: "text-node-event-icon",
	action: "text-node-action-icon",
	flow: "text-node-flow-icon",
	value: "text-node-value-icon",
	logic: "text-node-logic-icon",
} satisfies Record<NodeKind, string>;
