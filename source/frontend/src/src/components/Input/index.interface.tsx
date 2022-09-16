export interface Input {
	name: string;
	type: 'text' | 'password';
	placeholder?: string;
	variant?: string;
	value?: string;
	error?: string;
	required?: boolean;
	onChange?: ({ name, value }: { name: string; value: string }) => void;
}