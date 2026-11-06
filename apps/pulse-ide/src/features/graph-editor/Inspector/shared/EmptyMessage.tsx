import type { ReactNode } from "react";

export default function EmptyMessage({ children }: { children: ReactNode }) {
	return <p className="text-xs text-ui-muted">{children}</p>;
}
