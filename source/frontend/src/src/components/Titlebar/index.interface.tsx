import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";

export interface TitlebarProps {
	menu: Menu;
	user: User;
	connected: boolean;
}