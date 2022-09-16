import { NavigateFunction } from 'react-router-dom';

import { Menu } from '@/context/menu-context';
import { User } from '@/context/user-context';

import { ProfileInterface } from './components/index.interface';

interface Params {
	username: string;
	page?: string;
}

export interface ProfileProps {
	params: Params;
	user?: User;
}

export interface ProfileBaseProps {
	menu: Menu;
	page: string;
	value: string;
	navigate: NavigateFunction;
	profile: ProfileInterface;
	classname: string;

	setFriendship: (friendship?: string | undefined) => void;
}

export interface ProfileState {
	value?: string;
	classname?: string;
	username: string;
	profile?: Record<string, any>;
}