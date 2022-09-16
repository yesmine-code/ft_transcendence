export interface ProfileInterface {
	id: number;
	username: string;
	display_name: string;
	is_owner: boolean;
	avatar: string;
	status: 'ONLINE' | 'OFFLINE' | 'IN_GAME';
	friendship: 'BLOCKED' | 'DECLINED' | 'FRIEND' | 'PENDING';
	blocked?: boolean;
};