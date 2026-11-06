import type { ReactNode } from "react";

export default function PropertyRow({
	title,
	children,
}: {
	title: string;
	children: ReactNode;
}) {
	return (
		<div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-center gap-ui-2">
			<span className="text-xs text-ui-muted">{title}</span>
			<div className="min-w-0">{children}</div>
		</div>
	);
}
