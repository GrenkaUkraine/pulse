import "./App.css";
import TitleBar from "./layouts/components/TitleBar.tsx";

export default function App() {
	return (
		<main className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-ui-accent-10/15 bg-ui-background">
			<TitleBar />
		</main>
	);
}
