import { Initialize } from "./context";

export interface AppState extends Initialize {
	loading: boolean;
	connected: boolean;
	errors: {
		key: string;
		value: string;
		process: NodeJS.Timeout;
	}[];
}