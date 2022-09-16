export interface SelectPropsOption<T> {
	value: string;
	key: T;
	action?: (callback?: () => void) => void;
}

export interface SelectState<T = number | string> {
	options: SelectPropsOption<T>[];
	value?: T;
}

export interface SelectProps<T = number | string> extends SelectState {
	name: string;
	onChange?: ({ name, value }: { name: string, value: T }) => void;
}