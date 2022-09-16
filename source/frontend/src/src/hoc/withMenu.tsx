import React from 'react';

import MenuContext from "@/context/menu-context";


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (
			<MenuContext.Consumer>
			{(menu) => <Component {...props} menu={menu} />}
			</MenuContext.Consumer>
		);
	}

	return Wrapped;
};