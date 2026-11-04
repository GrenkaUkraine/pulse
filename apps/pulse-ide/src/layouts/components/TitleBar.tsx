import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpTrayIcon,
	Bars4Icon,
	Cog6ToothIcon,
	CubeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@radix-ui/themes";
import { getCurrentWindow } from "@tauri-apps/api/window";
import LogoPulse from "../../assets/LogoPulse.svg?react";
import WindowControls from "./WindowControls.tsx";

export default function TitleBar() {
	const appWindow = getCurrentWindow();

	return (
		<div className="flex items-center">
			<div className="flex gap-ui-3 p-ui-2 items-center">
				<LogoPulse
					role="img"
					aria-label="Pulse IDE"
					className="size-8 shrink-0"
				/>
				<IconButton
					size="2"
					variant="ghost"
					color="gray"
					aria-label="Menu"
					style={{ margin: 0 }}
				>
					<Bars4Icon aria-hidden="true" className="size-6" />
				</IconButton>
				<IconButton
					size="2"
					variant="ghost"
					color="gray"
					aria-label="Undo"
					style={{ margin: 0 }}
				>
					<ArrowLeftIcon aria-hidden="true" className="size-6" />
				</IconButton>
				<IconButton
					size="2"
					variant="ghost"
					color="gray"
					aria-label="Redo"
					style={{ margin: 0 }}
				>
					<ArrowRightIcon aria-hidden="true" className="size-6" />
				</IconButton>
			</div>

			<div data-tauri-drag-region className="flex-1 self-stretch" />

			<div className="flex">
				<div className="flex gap-ui-3 p-ui-2 items-center">
					<IconButton
						size="2"
						variant="ghost"
						color="gray"
						aria-label="Build"
						style={{ margin: 0 }}
					>
						<CubeIcon aria-hidden="true" className="size-6" />
					</IconButton>
					<IconButton
						size="2"
						variant="classic"
						aria-label="Upload"
						style={{ margin: 0 }}
					>
						<ArrowUpTrayIcon aria-hidden="true" className="size-6" />
					</IconButton>
				</div>
				<div data-tauri-drag-region className="w-6 self-stretch" />
				<div className="flex gap-ui-3 p-ui-2 items-center">
					<IconButton
						size="2"
						variant="ghost"
						color="gray"
						aria-label="Build"
						style={{ margin: 0 }}
					>
						<Cog6ToothIcon aria-hidden="true" className="size-6" />
					</IconButton>
					<IconButton
						size="2"
						variant="soft"
						aria-label="Donate"
						style={{ margin: 0 }}
					>
						<HeartIcon aria-hidden="true" className="size-6" />
					</IconButton>
				</div>
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
