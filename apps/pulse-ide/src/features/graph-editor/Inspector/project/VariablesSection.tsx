import { Button } from "@radix-ui/themes";
import EmptyMessage from "../shared/EmptyMessage";
import InspectorSection from "../shared/InspectorSection";

export default function VariablesSection({ search }: { search: string }) {
	if (!"variables".includes(search)) return null;
	return (
		<InspectorSection title="Variables" forceOpen={search !== ""}>
			<EmptyMessage>
				Project variables will be available here in a future update.
			</EmptyMessage>
			<Button size="1" variant="soft" color="gray" disabled>
				Add variable
			</Button>
		</InspectorSection>
	);
}
