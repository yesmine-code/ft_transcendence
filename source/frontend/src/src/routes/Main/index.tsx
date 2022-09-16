import React from 'react';

import withUser from '@/hoc/withUser';
import protectedRoute from '@/hoc/protectedRoute';

import { Body, Page } from '@/components/document';

import { MainProps } from './index.interface';
import styles from './index.styles.scss';


export default protectedRoute({ authenticated: true, fallback: '/signin' }, withUser(({ user }: MainProps) => {
	const display_name = user.user && user.user.display_name;

	return (
		<Page>
			<Body variant={styles.container}>
				<div className={styles.content}>
					<span className={styles.title} unselectable='on'>{`Hi ${display_name},`}</span>
					<span className={styles.subtitle} unselectable='on'>Welcome to ft_transcendence.</span>
				</div>
			</Body>
		</Page>
	);
}));