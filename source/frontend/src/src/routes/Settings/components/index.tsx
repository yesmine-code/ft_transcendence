import React from 'react';

import General from './General';
import Account from './Account';
import Security from './Security';

export default function Components({ value }: { value: string }) {
	if (value == 'general')
		return (<General />);

	if (value == 'account')
		return (<Account />);

	if (value == 'security')
		return (<Security />);

	return (<h1>Page not found!</h1>);
}