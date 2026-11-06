import { Select } from "@radix-ui/themes";
import type { BoardPin, PinMode } from "../../../project/project.types";
import { useGraphStore } from "../../graph.store";
import InspectorSection from "../shared/InspectorSection";
import PropertyRow from "../shared/PropertyRow";
import PinNameInput from "./PinNameInput";

const modes: { value: PinMode; label: string }[] = [
	{ value: "unused", label: "Unused" },
	{ value: "input", label: "Input" },
	{ value: "output", label: "Output" },
	{ value: "inputPullup", label: "Input Pull-up" },
];

export default function PinSettingsSection({
	pins,
	search,
}: {
	pins: BoardPin[];
	search: string;
}) {
	const mutate = useGraphStore((state) => state.mutate);
	const filtered = pins.filter((pin) =>
		[
			"pins",
			pin.label,
			pin.name ?? "",
			pin.number < 14 ? "digital" : "analog",
			modes.find((mode) => mode.value === pin.mode)?.label ?? "",
		]
			.join(" ")
			.toLowerCase()
			.includes(search),
	);
	if (filtered.length === 0) return null;
	return (
		<InspectorSection
			title="Pins"
			count={pins.filter((pin) => pin.mode !== "unused").length}
			defaultOpen
			forceOpen={search !== ""}
		>
			{["Digital", "Analog"].map((group) => {
				const groupPins = filtered.filter((pin) =>
					group === "Digital" ? pin.number < 14 : pin.number >= 14,
				);
				if (groupPins.length === 0) return null;
				return (
					<div key={group} className="flex flex-col gap-ui-2">
						<span className="text-[10px] text-ui-muted">{group}</span>
						{groupPins.map((pin) => (
							<div key={pin.number} className="flex flex-col gap-ui-2">
								<PropertyRow title={pin.label}>
									<Select.Root
										size="1"
										value={pin.mode}
										onValueChange={(value) => {
											const mode = modes.find((item) => item.value === value);
											if (mode)
												void mutate({
													type: "setPinMode",
													pin: pin.number,
													mode: mode.value,
												});
										}}
									>
										<Select.Trigger
											aria-label={`${pin.label} mode`}
											className="w-full"
										/>
										<Select.Content>
											{modes.map((mode) => (
												<Select.Item key={mode.value} value={mode.value}>
													{mode.label}
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</PropertyRow>
								{(pin.mode !== "unused" || pin.name) && (
									<PropertyRow title="Name">
										<PinNameInput pin={pin} />
									</PropertyRow>
								)}
							</div>
						))}
					</div>
				);
			})}
		</InspectorSection>
	);
}
