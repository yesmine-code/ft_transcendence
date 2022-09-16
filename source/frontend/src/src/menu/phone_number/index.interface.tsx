import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export enum PhoneNumberSteps {
	PRESENTATION = 'presentation',
	DETAILS = 'details',
	SEND_CODE = 'send_code',
	CONFIRMATION = 'confirmation'
}

export interface PhoneNumberProps {
	menu: Menu;
	user: User;
	data: {
		save?: (arg0: { name: string; value: string | number; }) => Promise<void>;
	};
	remove: (e?: any) => void;
}

export interface PhoneNumberFields {
	phone_number: string;
	code: string;
}

export interface PhoneNumberState {
	loading: boolean;
	step: PhoneNumberSteps;
	values: PhoneNumberFields;
	errors: Partial<PhoneNumberFields>;
}