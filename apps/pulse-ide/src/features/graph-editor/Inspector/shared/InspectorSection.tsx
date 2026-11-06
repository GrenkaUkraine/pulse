import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { type ReactNode, useState } from "react";
import { cn } from "../../../../shared/lib/cn";

interface InspectorSectionProps {
	title: string;
	count?: number;
	defaultOpen?: boolean;
	forceOpen?: boolean;
	children: ReactNode;
}

export default function InspectorSection({
	title,
	count,
	defaultOpen = false,
	forceOpen = false,
	children,
}: InspectorSectionProps) {
	const [expanded, setExpanded] = useState(defaultOpen);
	const open = expanded || forceOpen;
	return (
		<section className="border-t border-ui-border py-ui-3">
			<button
				type="button"
				aria-expanded={open}
				onClick={() => setExpanded((current) => !current)}
				className="flex w-full items-center gap-ui-1 text-xs font-medium text-ui-foreground"
			>
				<ChevronRightIcon
					aria-hidden="true"
					className={cn("size-3 transition-transform", open && "rotate-90")}
				/>
				{title}
				{count !== undefined && (
					<span className="text-ui-muted">({count})</span>
				)}
			</button>
			{open && <div className="mt-ui-3 flex flex-col gap-ui-3">{children}</div>}
		</section>
	);
}
