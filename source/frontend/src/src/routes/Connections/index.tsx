import React from 'react';
import { Link } from 'react-router-dom';

import protectedRoute from '@/hoc/protectedRoute';
import withParams from '@/hoc/withParams';

import { Page, Body, Header } from '@/components/document';

import Components from './components';

import { ConnectionsProps } from './index.interface';
import styles from './index.styles.scss';


export default protectedRoute({ authenticated: true, fallback: '/signin' }, withParams(({ params }: ConnectionsProps) => {
	const { page = 'requests' } = params;

	return (
		<Page>
			<Header variant={styles.header}>
				<div className={styles.content}>
					<Link className={`${styles.item}${page == 'requests' ? ` ${styles.active}` : ''}`} to={`/connections`} unselectable="on">Requests</Link>
					<Link className={`${styles.item}${page == 'friends' ? ` ${styles.active}` : ''}`} to={`/connections/friends`} unselectable="on">Friends</Link>
					<Link className={`${styles.item}${page == 'blocked' ? ` ${styles.active}` : ''}`} to={`/connections/blocked`} unselectable="on">Blocked</Link>
				</div>
			</Header>
			<Body>
				<Components value={page} />
			</Body>
		</Page>
	);
}));