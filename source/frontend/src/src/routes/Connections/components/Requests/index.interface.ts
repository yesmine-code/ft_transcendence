export interface RequestFields {
	id: number;
	type: number;
	user: {
		id: number;
		avatar: string;
		username: string;
		display_name: string;
	}
}

export interface RequestsState {
	requests?: RequestFields[];
}