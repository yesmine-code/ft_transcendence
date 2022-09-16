import { NavigateFunction } from "react-router-dom";

export interface GamesProps {
	params: {
		page?: string;
	};
	navigate: NavigateFunction
}