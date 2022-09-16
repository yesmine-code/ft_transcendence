import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface ConversationPasswordProps {
	menu: Menu;
	user: User;
	data: {
		value?: string;
		error?: string;
		save: (arg0: { name: string; value: string | number; }) => Promise<void>;
	};
	remove: (e: any) => void;
}

export interface ConversationPasswordState {
	loading: boolean;
	values: {
		password: string;
	};
	errors: {
		password?: string;
	}
}