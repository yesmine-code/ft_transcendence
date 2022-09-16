import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface UsernameFields {
	username: string;
}

export interface UsernameProps {
	menu: Menu;
	user: User;
	data: {
		save: (arg0: { name: string; value: string | number; }) => Promise<void>;
	};
	remove: (e: any) => void;
}

export interface UsernameState {
	loading: boolean;
	values: UsernameFields;
	errors: Partial<UsernameFields>;
}