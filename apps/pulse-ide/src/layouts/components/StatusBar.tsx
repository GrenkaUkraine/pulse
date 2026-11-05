import {
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
} from "@heroicons/react/16/solid";
import { Badge } from "@radix-ui/themes";

export default function StatusBar() {
	return (
		<div className="w-full flex justify-between p-ui-2">
			<Badge variant="outline" color="gray">
				Ready
			</Badge>
			<div className="flex gap-ui-3">
				<Badge variant="soft" color="yellow">
					<ExclamationTriangleIcon className="size-3" />0
				</Badge>
				<Badge variant="soft" color="red">
					<ExclamationCircleIcon className="size-3" />0
				</Badge>
			</div>
		</div>
	);
}
