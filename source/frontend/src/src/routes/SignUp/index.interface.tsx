export interface SignUpFields {
	username: string;
	email: string;
	password: string;
	confirm_password: string;
}

export interface SignUpState {
	values: SignUpFields;
	errors: Partial<SignUpFields>;
}