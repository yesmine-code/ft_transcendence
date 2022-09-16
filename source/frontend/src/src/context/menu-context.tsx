import react from "react";



export interface NavigationData {
	variant?: string;
	data?: Record<string, any>;
}

export interface MenuData extends NavigationData {
	name: string;
	key?: string;
}

export interface Menu {
	menu: MenuData[];
	addMenu: (props: MenuData) => void;
	removeMenu: (props?: string) => void;

	navigation?: NavigationData;
	setNavigation: (props?: NavigationData) => void;
}

export default react.createContext({
	menu: [],
	addMenu: () => {},
	removeMenu: () => {},

	navigation: undefined,
	setNavigation: () => {}
} as Menu);