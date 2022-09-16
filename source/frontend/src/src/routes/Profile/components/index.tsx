import React from 'react';

import Achievements from './Achievements';
import Levels from './Levels';
import Matches from './Matches';

import { ProfileInterface } from './index.interface';
import styles from './index.styles.scss';


export default function Components({ available, page, profile }: { available: boolean, page: string, profile: ProfileInterface }) {
	return (
		<>
			{
				available &&
				<>
					{
						page == 'matches' &&
						<Matches profile={profile} />
					}
					{
						page == 'levels' &&
						<Levels profile={profile} />
					}
					{
						page == 'achievements' &&
						<Achievements profile={profile} />
					}
				</>
			}
			{
				!available &&
				<div className={styles.blocked}>
					{
						profile.friendship == 'BLOCKED' &&
						<span unselectable="on"><b>{`@${profile.username}`}</b>{` is blocked`}</span>
					}
					{
						profile.friendship != 'BLOCKED' &&
						profile.blocked &&
						<span unselectable="on">You're blocked</span>
					}
				</div>
			}
		</>
	);
}