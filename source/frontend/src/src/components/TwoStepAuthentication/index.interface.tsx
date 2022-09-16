export interface TfaFields {
	code: string;
}

export interface TfaState {
	values: TfaFields;
	errors: Partial<TfaFields>;
}