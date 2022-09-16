export interface DirectMessage {
	owner: {
		id: number;
		username: string;
		display_name: string;
		avatar: string;
	};
	created: string;
	name: string;
	id: number;
}

export interface DirectMessagesState {
	direct_messages?: DirectMessage[]
}