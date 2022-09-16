import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface ProfileProps {
	menu: Menu;
	user: User;
	remove: (e: any) => void;
}

export interface ProfileValues {
	avatar?: Blob;
	display_name?: string;
}

export interface ProfileState {
	loading: boolean;
	values: ProfileValues;
	errors: ProfileValues;
	avatar?: string;
}