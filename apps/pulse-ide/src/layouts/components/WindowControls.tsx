import { MinusIcon, StopIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "../../shared/lib/cn";

interface WindowControlsProps {
	onMinimize: () => void;
	onToggleMaximize: () => void;
	onClose: () => void;
}

interface WindowControlButtonProps {
	icon: typeof XMarkIcon;
	label: string;
	onClick: () => void;
	variant?: "default" | "close";
}

export default function WindowControls({
	onMinimize,
	onToggleMaximize,
	onClose,
}: WindowControlsProps) {
	return (
		<div className="flex h-full">
			<WindowControlButton
				icon={MinusIcon}
				label="Minimize"
				onClick={onMinimize}
			/>
			<WindowControlButton
				icon={StopIcon}
				label="Maximize or restore"
				onClick={onToggleMaximize}
			/>
			<WindowControlButton
				icon={XMarkIcon}
				label="Close"
				onClick={onClose}
				variant="close"
			/>
		</div>
	);
}

function WindowControlButton({
	icon: Icon,
	label,
	onClick,
	variant = "default",
}: WindowControlButtonProps) {
	return (
		<button
			type="button"
			aria-label={label}
			title={label}
			onClick={onClick}
			className={cn(
				"flex h-full items-center justify-center px-ui-3 text-ui-gray-11",
				variant === "close"
					? "hover:bg-red-600 hover:text-white"
					: "hover:bg-ui-gray-5 hover:text-ui-foreground",
			)}
		>
			<Icon aria-hidden="true" className="size-4" />
		</button>
	);
}
