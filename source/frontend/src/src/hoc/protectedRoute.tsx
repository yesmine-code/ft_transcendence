import React from 'react';

import UserContext from "@/context/user-context";
import { Navigate } from 'react-router-dom';


interface Options {
	authenticated?: boolean;
	required_2fa?: boolean;
	fallback: string;
};

export default <P extends Record<string, any>>(options: Options, Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (
			<UserContext.Consumer>
			{({user}) => {
				if (!!user != !!options.authenticated)
					return <Navigate to={options.fallback} replace />;

				return <Component {...props} user={user} />;
			}}
			</UserContext.Consumer>
		);
	}

	return Wrapped;
};