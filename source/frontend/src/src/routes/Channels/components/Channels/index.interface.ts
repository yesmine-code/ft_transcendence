export interface Channel {
	owner: {
		id: number;
		username: string;
		display_name: string;
		avatar: string;
	};
	created: string;
	visibility: 'PUBLIC' | 'PRIVATE' | 'PROTECTED';
	name: string;
	id: number;
}

export interface ChannelState {
	invitations?: Channel[],
	channels?: Channel[]
}