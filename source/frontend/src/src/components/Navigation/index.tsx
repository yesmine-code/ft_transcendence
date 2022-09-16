import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import withUser from '@/hoc/withUser';
import withMenu from '@/hoc/withMenu';

import fetch from '@/bundles/fetch';

import { User } from '@/context/user-context';
import { Menu } from '@/context/menu-context';

import ProfilePicture from '@/components/ProfilePicture';

import styles from './index.styles.scss';


export default withMenu(withUser(({ menu, user }: { menu: Menu, user: User }) => {
	if (!menu.navigation || !user.user)
		return null;

	const container = React.createRef<HTMLDivElement>();

	const pathname = useLocation().pathname.split('/').slice(1);
	const page = pathname.length > 0 ? pathname[0] : '';

	const logout = async () => {
		await fetch.request.json<Record<string, any>>('/api/auth/logout');

		menu.setNavigation.bind(this, undefined);
	}

	document.body.onclick = (event) => {
		const target = event.target;
		const navigation = container.current;
		const navigation_button = document.getElementById("navigation_menu_button");
		if (!target || !navigation || !navigation_button) return;

		const contains_navigation = event.composedPath().includes(navigation);
		const contains_button = event.composedPath().includes(navigation_button);
		if (contains_navigation || contains_button) return;

		menu.setNavigation(undefined);
	}

	return (
		<div ref={container} className={styles.container}>
			<ProfilePicture
				src={user.user.avatar}
				variant={styles.profile_picture} />
			<span className={styles.display_name}>{`${user.user.display_name || `@${user.user.username}`}`}</span>
			<div className={styles.menu}>
				{
					!(user.user.required_2fa || user.user.isFirstLogin) &&
					<>
						<Link
							className={`${styles.item}${page == user.user.username ? ` ${styles.active}` : ''}`}
							onClick={menu.setNavigation.bind(this, undefined)}
							to={`/${user.user.username}`}
							unselectable="on">
							Profile
						</Link>
						<Link
							className={`${styles.item}${page == 'connections' ? ` ${styles.active}` : ''}`}
							onClick={menu.setNavigation.bind(this, undefined)}
							to={`/connections`}
							unselectable="on">
							Connections
						</Link>
						<Link
							className={`${styles.item}${page == 'channels' ? ` ${styles.active}` : ''}`}
							onClick={menu.setNavigation.bind(this, undefined)}
							to={`/channels`}
							unselectable="on">
							Channels
						</Link>
						<Link
							className={`${styles.item}${page == 'direct_messages' ? ` ${styles.active}` : ''}`}
							onClick={menu.setNavigation.bind(this, undefined)}
							to={`/direct_messages`}
							unselectable="on">
							Direct messages
						</Link>
						<Link
							className={`${styles.item}${page == 'games' ? ` ${styles.active}` : ''}`}
							onClick={menu.setNavigation.bind(this, undefined)}
							to={`/games`}
							unselectable="on">
							Games
						</Link>
						<Link
							className={`${styles.item}${page == 'settings' ? ` ${styles.active}` : ''}`}
							onClick={menu.setNavigation.bind(this, undefined)}
							to={`/settings`}
							unselectable="on">
							Settings
						</Link>
					</>
				}
				<button
					className={styles.item}
					onClick={logout}
					unselectable="on">
					Logout
				</button>
			</div>
		</div>
	)
}));