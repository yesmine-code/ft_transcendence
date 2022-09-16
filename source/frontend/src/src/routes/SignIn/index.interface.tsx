export interface SignInFields {
	email: string;
	password: string;
}

export interface SignInState {
	values: SignInFields;
	errors: Partial<SignInFields>;
}