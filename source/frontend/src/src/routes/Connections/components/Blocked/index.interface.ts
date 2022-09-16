export interface BlockedFields {
	id: number;
	type: number;
	user: {
		id: number;
		avatar: string;
		username: string;
		display_name: string;
	}
}

export interface BlockedState {
	requests?: BlockedFields[];
}