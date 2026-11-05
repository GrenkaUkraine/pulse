import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpTrayIcon,
	Bars4Icon,
	Cog6ToothIcon,
	CubeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { getCurrentWindow } from "@tauri-apps/api/window";
import LogoPulse from "../../assets/LogoPulse.svg?react";
import { useGraphStore } from "../../features/graph-editor/graph.store";
import { ToolbarButton } from "../../shared/ui/ToolbarButton";
import { ToolbarGroup } from "../../shared/ui/ToolbarGroup";
import WindowControls from "./WindowControls.tsx";

export default function TitleBar() {
	const appWindow = getCurrentWindow();
	const canUndo = useGraphStore((state) => state.canUndo);
	const canRedo = useGraphStore((state) => state.canRedo);
	const mutate = useGraphStore((state) => state.mutate);

	return (
		<div className="flex items-center">
			<ToolbarGroup>
				<LogoPulse
					role="img"
					aria-label="Pulse IDE"
					className="size-8 shrink-0"
				/>
				<ToolbarButton icon={Bars4Icon} aria-label="Menu" />
				<ToolbarButton
					icon={ArrowLeftIcon}
					aria-label="Undo"
					title="Undo (Ctrl+Z)"
					disabled={!canUndo}
					onClick={() => void mutate({ type: "undo" })}
				/>
				<ToolbarButton
					icon={ArrowRightIcon}
					aria-label="Redo"
					title="Redo (Ctrl+Shift+Z)"
					disabled={!canRedo}
					onClick={() => void mutate({ type: "redo" })}
				/>
			</ToolbarGroup>

			<div data-tauri-drag-region className="flex-1 self-stretch" />

			<div className="flex">
				<ToolbarGroup>
					<ToolbarButton icon={CubeIcon} aria-label="Build" />
					<ToolbarButton
						icon={ArrowUpTrayIcon}
						aria-label="Upload"
						variant="classic"
						color="crimson"
					/>
				</ToolbarGroup>
				<div data-tauri-drag-region className="w-6 self-stretch" />
				<ToolbarGroup>
					<ToolbarButton icon={Cog6ToothIcon} aria-label="Settings" />
					<ToolbarButton
						icon={HeartIcon}
						aria-label="Donate"
						variant="soft"
						color="crimson"
					/>
				</ToolbarGroup>
				<div>
					<WindowControls
						onMinimize={() => void appWindow.minimize().catch(console.error)}
						onToggleMaximize={() =>
							void appWindow.toggleMaximize().catch(console.error)
						}
						onClose={() => void appWindow.close().catch(console.error)}
					/>
				</div>
			</div>
		</div>
	);
}
