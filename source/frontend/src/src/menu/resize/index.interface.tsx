import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface ResizeDataProps {
	image: HTMLImageElement;
	width: number;
	height: number;
	save: (avatar: Blob) => void;
}

export interface ResizeProps {
	menu: Menu;
	user: User;
	data: ResizeDataProps;
	remove: (e: any) => void;
}

export interface ResizeState {
	image: {
		x: number;
		y: number;
	};
	size: {
		width: number;
		height: number;
	};
	progress: null;
	scale: number;
	cursor: number;
}