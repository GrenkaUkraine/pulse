import type { ComponentProps } from "react";
import { cn } from "../lib/cn";

interface ToolbarGroupProps extends ComponentProps<"div"> {
	direction?: "horizontal" | "vertical";
}

export function ToolbarGroup({
	direction = "horizontal",
	className,
	children,
	...props
}: ToolbarGroupProps) {
	return (
		<div
			{...props}
			className={cn(
				"flex items-center gap-ui-3 p-ui-2",
				direction === "vertical" ? "flex-col" : "flex-row",
				className,
			)}
		>
			{children}
		</div>
	);
}
