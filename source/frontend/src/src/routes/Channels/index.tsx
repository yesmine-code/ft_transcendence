import React from 'react';

import protectedRoute from '@/hoc/protectedRoute';
import withNavigate from '@/hoc/withNavigate';
import withParams from '@/hoc/withParams';

import Chat from './components/Chat';
import Channels from './components/Channels';

import { ChannelsProps } from './index.interface';

export default protectedRoute({ authenticated: true, fallback: '/signin' }, withNavigate(withParams(({ params, navigate }: ChannelsProps) => {
	const { page = null } = params;

	if (page) {
		return <Chat conversationID={page} navigate={navigate} />
	}

	return <Channels />
})));