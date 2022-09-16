import { NavigateFunction } from "react-router-dom";
import { Menu } from "@/context/menu-context";


export interface GameState {
	deleted: boolean;
	connected: Boolean;
}

export interface GameProps {
	user: UserData;
	menu: Menu;
	navigate: NavigateFunction;
	gameID: string;
}