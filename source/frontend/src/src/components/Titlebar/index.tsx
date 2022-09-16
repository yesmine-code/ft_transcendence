import React from 'react';
import { Link } from 'react-router-dom';

import withUser from '@/hoc/withUser';
import withMenu from '@/hoc/withMenu';

import ProfilePicture from '@/components/ProfilePicture';

import Search from './components/Search';

import { TitlebarProps } from './index.interface';

import styles from './index.styles.scss';


export default withUser(withMenu(({ menu, user, connected }: TitlebarProps) => {
	return (
		<>
			{
				!connected &&
				<div className={styles.offline}>
					<span unselectable='on'>You are offline. We are going to reconnect as soon as possible.</span>
				</div>
			}
			<div className={`${styles.container}${!connected ? ` ${styles.disconnected}` : ''}`}>
				<div className={styles.content}>
					<div className={styles.title_container}>
						<Link className={styles.title} to='/'>FT_TRANSCENDENCE</Link>
						{
							user.user && !(user.user?.required_2fa || user.user?.isFirstLogin) &&
							<Search />
						}
					</div>
					<div>
						{
							!(user.user) &&
							<Link className={styles.signin} to='/signin'>Sign in</Link>
						}
						{
							(user.user) &&
							<div>
								<button
									id="navigation_menu_button"
									className={styles.menu}
									onClick={
										menu.setNavigation.bind(
											this,
											menu.navigation
											? undefined
											: {
												variant: styles.navigation
											}
										)
									}>
									<ProfilePicture src={user.user.avatar} />
								</button>
							</div>
						}
					</div>
				</div>
			</div>
		</>
	);
}));