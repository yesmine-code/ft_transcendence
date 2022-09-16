import { GlobalEvent } from "./pointers.types";

export { GlobalEvent };


export const getPointers = (event: GlobalEvent) => {
	let pointers: {x: number; y: number;}[] = [];

	if (event instanceof TouchEvent) {
		for (let i = 0; i < event.targetTouches.length; i++) {
			const item = event.targetTouches.item(i);

			if (!item)
				continue;

			pointers.push({
				x: item.clientX,
				y: item.clientY
			});
		}
	} else if (event instanceof MouseEvent) {
		pointers.push({
			x: event.clientX,
			y: event.clientY
		});
	}

	return pointers;
}