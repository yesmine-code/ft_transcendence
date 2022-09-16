import { Menu } from "@/context/menu-context";
import { User } from "@/context/user-context";
import { NavigateFunction } from "react-router-dom";

export interface AboutYourselfProps {
	menu: Menu;
	user: User;
	navigate: NavigateFunction;
}

export interface AboutYourselfFields {
	avatar?: Blob;
	display_name?: string;
}

export interface AboutYourselfState {
	loading: boolean;
	values: AboutYourselfFields;
	errors: AboutYourselfFields;
	avatar?: string;
}