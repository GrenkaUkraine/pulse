import { Text } from "@radix-ui/themes";
import type { PropsWithChildren } from "react";
import { cn } from "../lib/cn.ts";

interface PanelContainerProps extends PropsWithChildren {
	title?: string;
	hasPadding?: boolean;
	hasGap?: boolean;
	className?: string;
}

export default function PanelContainer({
	children,
	title,
	hasPadding = true,
	hasGap = true,
	className,
}: PanelContainerProps) {
	return (
		<div
			className={cn(
				"flex h-full flex-col bg-ui-background bg-[linear-gradient(var(--color-surface),var(--color-surface))] rounded-ui-3",
				hasPadding && "p-ui-3",
				hasGap && "gap-ui-2",
				className,
			)}
		>
			{title && (
				<Text size="2" weight="bold">
					{title}
				</Text>
			)}
			{children}
		</div>
	);
}
