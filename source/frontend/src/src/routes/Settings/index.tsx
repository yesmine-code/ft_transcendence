import React from 'react';
import { Link } from 'react-router-dom';

import protectedRoute from '@/hoc/protectedRoute';
import withParams from '@/hoc/withParams';

import { Page, Body, Header } from '@/components/document';

import Components from './components';

import { SettingsProps } from './index.interface';
import styles from './index.styles.scss';


export default withParams(protectedRoute({ authenticated: true, fallback: '/signin' }, ({ params }: SettingsProps) => {
	const { page = 'general' } = params;

	return (
		<Page>
			<Header variant={styles.header}>
				<div className={styles.content}>
					<Link className={`${styles.item}${page == 'general' ? ` ${styles.active}` : ''}`} to={`/settings`} unselectable="on">General</Link>
					<Link className={`${styles.item}${page == 'account' ? ` ${styles.active}` : ''}`} to={`/settings/account`} unselectable="on">Account</Link>
					<Link className={`${styles.item}${page == 'security' ? ` ${styles.active}` : ''}`} to={`/settings/security`} unselectable="on">Security</Link>
				</div>
			</Header>
			<Body>
				<Components value={page} />
			</Body>
		</Page>
	);
}))