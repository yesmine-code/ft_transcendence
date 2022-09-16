import React from 'react';

import protectedRoute from '@/hoc/protectedRoute';
import withNavigate from '@/hoc/withNavigate';
import withParams from '@/hoc/withParams';

import Chat from './components/Chat';
import DirectMessages from './components/DirectMessages';

import { DirectMessagesProps } from './index.interface';

export default protectedRoute({ authenticated: true, fallback: '/signin' }, withNavigate(withParams(({ params, navigate }: DirectMessagesProps) => {
	const { page = null } = params;

	if (page) {
		return <Chat conversationID={page} navigate={navigate} />
	}

	return <DirectMessages />
})));