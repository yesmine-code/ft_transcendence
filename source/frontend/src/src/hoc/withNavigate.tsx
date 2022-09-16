import React from 'react';
import { useNavigate } from 'react-router-dom';


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		return (<Component {...props} navigate={useNavigate()} />);
	}

	return Wrapped;
};