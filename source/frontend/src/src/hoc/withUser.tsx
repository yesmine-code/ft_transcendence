import React from 'react';

import UserContext from "@/context/user-context";


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (
			<UserContext.Consumer>
			{(user) => <Component {...props} user={user} />}
			</UserContext.Consumer>
		);
	}

	return Wrapped;
};