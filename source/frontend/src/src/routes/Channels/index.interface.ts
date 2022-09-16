import { NavigateFunction } from "react-router-dom";

export interface ChannelsProps {
	params: {
		page?: string;
	};
	navigate: NavigateFunction
}