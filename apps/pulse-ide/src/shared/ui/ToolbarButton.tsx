import type { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { IconButton } from "@radix-ui/themes";
import type { ComponentProps } from "react";

interface ToolbarButtonProps
	extends Omit<ComponentProps<typeof IconButton>, "children" | "asChild"> {
	icon: typeof ArrowLeftIcon;
	activeIcon?: typeof ArrowLeftIcon;
	active?: boolean;
	"aria-label": string;
}

export function ToolbarButton({
	icon,
	activeIcon,
	active,
	size = "2",
	variant,
	color = "gray",
	style,
	...props
}: ToolbarButtonProps) {
	const Icon = active && activeIcon ? activeIcon : icon;
	return (
		<IconButton
			size={size}
			variant={variant ?? (active ? "soft" : "ghost")}
			color={color}
			style={{ margin: 0, ...style }}
			aria-pressed={active}
			data-state={
				active === undefined ? undefined : active ? "active" : "inactive"
			}
			{...props}
		>
			<Icon aria-hidden="true" className="size-5" />
		</IconButton>
	);
}
