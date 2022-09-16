import React from 'react';

import OptionContext from "@/context/option-context";


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (
			<OptionContext.Consumer>
			{(option) => <Component {...props} option={option} />}
			</OptionContext.Consumer>
		);
	}

	return Wrapped;
};