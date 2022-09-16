import React from 'react';

import StatusContext from "@/context/status-context";


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (
			<StatusContext.Consumer>
			{(status) => <Component {...props} status={status} />}
			</StatusContext.Consumer>
		);
	}

	return Wrapped;
};