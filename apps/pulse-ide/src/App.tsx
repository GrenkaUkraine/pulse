import "./App.css";
import LeftActivityBar from "./layouts/components/LeftActivityBar.tsx";
import RightActivityBar from "./layouts/components/RightActivityBar.tsx";
import StatusBar from "./layouts/components/StatusBar.tsx";
import TitleBar from "./layouts/components/TitleBar.tsx";
import WorkbenchLayout from "./layouts/WorkbenchLayout";

export default function App() {
	return (
		<main className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-ui-accent-10/15 bg-ui-background">
			<TitleBar />
			<div className="flex min-h-0 flex-1 items-stretch">
				<LeftActivityBar />
				<div className="min-h-0 min-w-0 flex-1">
					<WorkbenchLayout />
				</div>
				<RightActivityBar />
			</div>
			<StatusBar />
		</main>
	);
}
