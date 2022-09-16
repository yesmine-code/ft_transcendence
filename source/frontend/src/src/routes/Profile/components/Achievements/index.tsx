import fetch from '@/bundles/fetch';
import React from 'react';

import { AchievementEnum, AchievementsProps, AchievementsState } from './index.interface';
import styles from './index.styles.scss';

export const Achievement = ({ icon, color, value, active }: { icon: number; color: 'blue' | 'red'; value: string; active: boolean }) => {
	return (
		<div className={`${styles.item}${active ? ` ${styles.active}` : ''}`} data-color={color}>
			<div className={styles.item_icon}>
				<span unselectable='on'>{icon}</span>
			</div>
			<span unselectable='on'>{value}</span>
		</div>
	);
}

export default class Achievements extends React.Component<AchievementsProps> {
	state: AchievementsState;
	protectState: boolean;

	constructor(props: AchievementsProps | Readonly<AchievementsProps>) {
		super(props);

		this.state = {
			achievements: []
		};


		this.protectState = false;

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
		this.init = this.init.bind(this);
	}

	async componentDidMount() {
		this.openProtectedState();
		await this.init();
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}


	/* getters */
	private get userID() {
		return (Number(this.props.profile.id));
	}

	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}

	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }

	async init() {
		const achievements = await fetch.request.json('/achievements/list', { user_id: this.userID });

		this.setProtectedState({ achievements });
	}

	render() {
		const { achievements } = this.state;

		return (
			<div className={styles.container}>
				<div className={styles.content}>
					<Achievement icon={10} color='blue' value='Win 10 times' active={achievements.includes(AchievementEnum.WIN_10_TIMES)} />
					<Achievement icon={25} color='blue' value='Win 25 times' active={achievements.includes(AchievementEnum.WIN_25_TIMES)} />
					<Achievement icon={50} color='blue' value='Win 50 times' active={achievements.includes(AchievementEnum.WIN_50_TIMES)} />
					<Achievement icon={100} color='blue' value='Expert: win 100 times' active={achievements.includes(AchievementEnum.EXPERT)} />
				</div>
				<div className={styles.content}>
					<Achievement icon={10} color='red' value='Play 10 times' active={achievements.includes(AchievementEnum.PLAY_10_TIMES)} />
					<Achievement icon={25} color='red' value='Play 25 times' active={achievements.includes(AchievementEnum.PLAY_25_TIMES)} />
					<Achievement icon={50} color='red' value='Play 50 times' active={achievements.includes(AchievementEnum.PLAY_50_TIMES)} />
				</div>
			</div>
		);
	}
}