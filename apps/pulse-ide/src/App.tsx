import "./App.css";
import LeftActivityBar from "./layouts/components/LeftActivityBar.tsx";
import StatusBar from "./layouts/components/StatusBar.tsx";
import TitleBar from "./layouts/components/TitleBar.tsx";

export default function App() {
	return (
		<main className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-ui-accent-10/15 bg-ui-background">
			<TitleBar />
			<div className="flex flex-1 items-stretch">
				<LeftActivityBar />
			</div>
			<StatusBar />
		</main>
	);
}
