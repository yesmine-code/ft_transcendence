import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface InvitePeopleProps {
	menu: Menu;
	user: User;
	data: {
		conversation_id: string;
		save: (arg0: Record<string, any>) => Promise<void>;
	};
	remove: (e: any) => void;
}

export interface InvitePeopleMember {
	id: number;
	username: string;
	display_name: string;
	avatar: string;
	member: boolean;
}

export interface InvitePeopleFields {
	members: InvitePeopleMember[];
}

export interface InvitePeopleState {
	loading: boolean;
	results: InvitePeopleMember[];
}