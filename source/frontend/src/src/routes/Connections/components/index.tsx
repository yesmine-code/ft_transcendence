import React from 'react';

import Requests from './Requests';
import Friends from './Friends';
import Blocked from './Blocked';

export default function Components({ value }: { value: string }) {
	if (value == 'requests')
		return (<Requests />);

	if (value == 'friends')
		return (<Friends />);

	if (value == 'blocked')
		return (<Blocked />);

	return (<h1>Page not found!</h1>);
}