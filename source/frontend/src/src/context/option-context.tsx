import react from "react";

export interface OptionElement {
	value: string;
	valid?: boolean;
	action: () => void;
}

export interface OptionData {
	target: HTMLButtonElement;
	options: OptionElement[]
}

export interface Option {
	option?: OptionData;
	setOption: (props?: OptionData) => void;
}

export default react.createContext({
	option: undefined,
	setOption: () => {}
} as Option);