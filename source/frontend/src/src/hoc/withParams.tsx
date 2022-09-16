import React from 'react';
import { useParams } from 'react-router-dom';


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (<Component {...props} params={useParams()} />);
	}

	return Wrapped;
};