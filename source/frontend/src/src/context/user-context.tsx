import react from "react";

export interface User {
	user?: UserData;
	setUser: (props?: Partial<UserData>) => void;
}

export default react.createContext({
	user: undefined,
	setUser: () => {}
} as User);