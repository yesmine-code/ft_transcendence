import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface ConversationFields {
	name: string;
	visibility: 'public' | 'private' | 'protected';
	password: string;
}

export interface ConversationProps {
	menu: Menu;
	user: User;
	data: {
		channelID?: number;
		fields?: ConversationFields;
		save: (arg0: Record<string, any>) => Promise<void>;
	};
	remove: (e: any) => void;
}

export interface ConversationState {
	loading: boolean;
	values: Partial<ConversationFields>;
	errors: Partial<ConversationFields>;
}