import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";
import { NavigateFunction } from "react-router-dom";

export interface GameProps {
	menu: Menu;
	user: User;
	navigate: NavigateFunction,
	data: {
		opponent_id?: number;
		conversation_id?: number;
		save: (arg0: { name: string; value: string | number; }) => Promise<void>;
	};
	remove: () => void;
}

export interface GameState {
	loading: boolean;
	queuing: boolean;
	game_id?: number;
}