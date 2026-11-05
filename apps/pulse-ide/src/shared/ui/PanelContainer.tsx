import { Text } from "@radix-ui/themes";
import type { PropsWithChildren } from "react";
import { cn } from "../lib/cn.ts";

interface PanelContainerProps extends PropsWithChildren {
	title?: string;
	className?: string;
}

export default function PanelContainer({
	children,
	title,
	className,
}: PanelContainerProps) {
	return (
		<div
			className={cn(
				"flex h-full flex-col gap-ui-2 bg-ui-background bg-[linear-gradient(var(--color-surface),var(--color-surface))] p-ui-3 rounded-ui-3",
				className,
			)}
		>
			<Text size="2" weight="bold">
				{title}
			</Text>
			{children}
		</div>
	);
}
