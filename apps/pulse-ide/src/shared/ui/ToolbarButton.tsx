import type { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { IconButton } from "@radix-ui/themes";
import type { ComponentProps } from "react";

interface ToolbarButtonProps
	extends Omit<ComponentProps<typeof IconButton>, "children" | "asChild"> {
	icon: typeof ArrowLeftIcon;
	"aria-label": string;
}

export function ToolbarButton({
	icon: Icon,
	size = "2",
	variant = "ghost",
	color = "gray",
	style,
	...props
}: ToolbarButtonProps) {
	return (
		<IconButton
			size={size}
			variant={variant}
			color={color}
			style={{ margin: 0, ...style }}
			{...props}
		>
			<Icon aria-hidden="true" className="size-5" />
		</IconButton>
	);
}
