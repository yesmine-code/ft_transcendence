import { NavigateFunction } from "react-router-dom";

export interface DirectMessagesProps {
	params: {
		page?: string;
	};
	navigate: NavigateFunction
}