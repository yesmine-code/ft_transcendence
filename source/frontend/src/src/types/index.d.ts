export {};

declare global {
	interface UserData {
		id: number;
		username: string;
		display_name: string;
		avatar: string;
		phone_number?: string;
		phone_number_confirmed: boolean;
		two_step_authentication: boolean;
		required_2fa: boolean;
		theme: 'light' | 'dark' | 'auto';
		map: 'black' | 'red' | 'green' | 'blue';
		level: number;
		isFirstLogin: boolean;
	}

	interface Window {
		_ft_init: {
			token: string;
			user?: UserData;
		}; 
	}
}