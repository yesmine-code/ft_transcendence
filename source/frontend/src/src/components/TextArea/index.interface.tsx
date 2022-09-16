export interface TextArea {
	name: string;
	placeholder?: string;
	variant?: string;
	value?: string;
	onInput?: () => void;
	onChange?: ({ name, value }: { name: string; value: string }) => void;
}