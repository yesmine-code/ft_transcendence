import React from 'react';

import protectedRoute from '@/hoc/protectedRoute';
import withNavigate from '@/hoc/withNavigate';
import withParams from '@/hoc/withParams';

import Game from './components/Game';
import Games from './components/Games';

import { GamesProps } from './index.interface';

export default protectedRoute({ authenticated: true, fallback: '/signin' }, withNavigate(withParams(({ params, navigate }: GamesProps) => {
	const { page = null } = params;

	if (page) {
		return <Game gameID={page} navigate={navigate} />
	}

	return <Games />
})));