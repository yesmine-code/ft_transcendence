import react from "react";


export interface Status {
	status: number;
	setStatus: (props: number) => void;
}

export default react.createContext({
	status: 200,
	setStatus: () => {}
} as Status);