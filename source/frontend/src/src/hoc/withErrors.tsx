import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { FormError } from '@/bundles/fetch';


export default <P extends Record<string, any>>(Component: React.ComponentType<P>) => {
	const Wrapped = (props: any) => {
		const [errors, setErrors] = useState<string[]>([]);

		try {
			return (<Component {...props} errors={errors} />);
		} catch (e: unknown) {
			if (!(e instanceof FormError)) return;

			for (const message in e.message) {
				setErrors(e.message[message]);
			}
		}
	}

	return Wrapped;
};