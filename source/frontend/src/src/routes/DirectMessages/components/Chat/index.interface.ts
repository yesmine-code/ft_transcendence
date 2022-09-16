export enum MessageUserRole {
	OWNER = 'owner',
	ADMIN = 'admin',
	MEMBER = 'member',
	BANNED = 'banned',
	MUTED = 'muted',
	PENDING = 'pending'
}

export enum MessageUserStatus {
	OFFLINE = "OFFLINE",
	ONLINE = "ONLINE",
	IN_GAME = "IN_GAME",
	NONE = "NONE",
}

export interface MessageUser {
	id: number;
	username: string;
	display_name: string;
	avatar: string;
	action: 'none' | 'writing' | 'playing';
	role: MessageUserRole;
	status: MessageUserStatus;
}

export interface GameMessage {
	id: number;
	created: string;
	target: MessageUser;
}

export interface Message {
	author: MessageUser;
	game?: GameMessage;
	date: string;
	value: string;
	id: number;
}

export interface MessageInfo {
	name: string;
	visibility: 'public' | 'private' | 'protected';
	invalid_password?: boolean;
	role?: MessageUserRole;
	members?: MessageUser[];
}

export interface MessageState {
	info?: MessageInfo;
	writing?: NodeJS.Timeout;
	password?: string;
	quite: boolean;
	messages: Message[]
}