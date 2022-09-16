import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { Status } from '@/context/status-context';
import { Option } from '@/context/option-context';

import withStatus from '@/hoc/withStatus';
import withOption from '@/hoc/withOption';

import Main from '@/routes/Main';
import Game from '@/routes/Game';
import SignIn from '@/routes/SignIn';
import SignUp from '@/routes/SignUp';
import Profile from '@/routes/Profile';
import Settings from '@/routes/Settings';
import Channels from '@/routes/Channels';
import Connections from '@/routes/Connections';
import DirectMessages from '@/routes/DirectMessages';

import styles from './index.styles.scss';


export default withStatus(withOption(({ option, status }: { option: Option; status: Status }) => {
	const location = useLocation();

	useEffect(() => {
		status.setStatus(200);
		option.setOption();
	}, [location]);

	const error = [403, 404, 500].includes(status.status);

	return (
		error
		? <div className={styles.error}>
			<div className={styles.error_content}>
				<span className={styles.title} unselectable='on'>Oops!</span>
				<span className={styles.message} unselectable='on'>The page you are looking for cannot be found.</span>
			</div>
			</div>
		: <div className={styles.container}>
			<Routes>
				<Route
					path="/signin"
					element={<SignIn />} />
				<Route
					path="/signup"
					element={<SignUp />} />
				<Route
					path="/games"
					element={<Game />} />
				<Route
					path="/games/:page"
					element={<Game />} />
				<Route
					path="/connections"
					element={<Connections />} />
				<Route
					path="/connections/:page"
					element={<Connections />} />
				<Route
					path="/channels"
					element={<Channels />} />
				<Route
					path="/channels/:page"
					element={<Channels />} />
				<Route
					path="/direct_messages"
					element={<DirectMessages />} />
				<Route
					path="/direct_messages/:page"
					element={<DirectMessages />} />
				<Route
					path="/settings"
					element={<Settings />} />
				<Route
					path="/settings/:page"
					element={<Settings />} />
				<Route
					path="/:username"
					element={<Profile />} />
				<Route
					path="/:username/:page"
					element={<Profile />} />
				<Route
					path="/*"
					element={<Main />} />
			</Routes>
		</div>
	);
}));