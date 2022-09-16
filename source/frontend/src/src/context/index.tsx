import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import StatusContext, { Status } from './status-context';
import UserContext, { User } from './user-context';
import MenuContext, { Menu } from './menu-context';
import OptionContext, { Option } from './option-context';


export interface Initialize {
	status: Status;
	user: User;
	menu: Menu;
	option: Option;
}

export default function Init({ value, children }: { value: Initialize, children: any }) {
	const { status, user, menu, option } = value;

	return (
		<StatusContext.Provider value={status}>
			<UserContext.Provider value={user}>
				<MenuContext.Provider value={menu}>
					<OptionContext.Provider value={option}>
						<BrowserRouter>
							{ children }
						</BrowserRouter>
					</OptionContext.Provider>
				</MenuContext.Provider>
			</UserContext.Provider>
		</StatusContext.Provider>
	);
}