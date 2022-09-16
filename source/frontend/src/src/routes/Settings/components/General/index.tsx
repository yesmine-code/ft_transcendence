import React from 'react';

import withUser from '@/hoc/withUser';

import { User } from '@/context/user-context';

import styles from './index.styles.scss';
import fetch from '@/bundles/fetch';


export default withUser(class General extends React.Component<{ user: User }> {
	protectState: boolean;
	state: {};

	constructor(props: any) {
		super(props);

		this.state = {};

		this.protectState = false;

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	componentDidMount() {
		this.openProtectedState();
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}

	/* handler */
	async onTheme(theme: 'light' | 'dark' | 'auto') {
		const { user } = this.props;

		user.setUser({ theme });
		await fetch.request.json('/users/theme', { theme });
	}

	async onMap(map: 'black' | 'blue' | 'red' | 'green') {
		const { user } = this.props;

		user.setUser({ map });
		await fetch.request.json('/users/map', { map });
	}

	/* getters */
	private get theme() {
		const { user } = this.props;

		return user.user?.theme || 'auto';
	}

	private get map() {
		const { user } = this.props;

		return user.user?.map || 'black';
	}

	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}

	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		return (
			<div className={styles.container}>
				<div className={styles.section}>
					<span className={styles.title} unselectable='on'>Display</span>
					<div className={styles.section_content}>
						<div className={styles.section_item}>
							<div className={styles.section_item_header}>
								<span className={styles.title} unselectable='on'>Theme</span>
								<span className={styles.subtitle} unselectable='on'>Manage the background color of your account.</span>
							</div>
							<div className={styles.section_item_content}>
								<button className={`${styles.light}${this.theme == 'light' ? ` ${styles.active}` : ''}`} onClick={() => { this.onTheme('light'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Light</span>
								</button>
								<button className={`${styles.dark}${this.theme == 'dark' ? ` ${styles.active}` : ''}`} onClick={() => { this.onTheme('dark'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Dark</span>
								</button>
								<button className={`${styles.auto}${this.theme == 'auto' ? ` ${styles.active}` : ''}`} onClick={() => { this.onTheme('auto'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Auto</span>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div className={styles.section}>
					<span className={styles.title} unselectable='on'>Game</span>
					<div className={styles.section_content}>
						<div className={styles.section_item}>
							<div className={styles.section_item_header}>
								<span className={styles.title} unselectable='on'>Map</span>
								<span className={styles.subtitle} unselectable='on'>Manage the map of your games.</span>
							</div>
							<div className={styles.section_item_content}>
								<button className={`${styles.black}${this.map == 'black' ? ` ${styles.active}` : ''}`} onClick={() => { this.onMap('black'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Black</span>
								</button>
								<button className={`${styles.blue}${this.map == 'blue' ? ` ${styles.active}` : ''}`} onClick={() => { this.onMap('blue'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Blue</span>
								</button>
								<button className={`${styles.red}${this.map == 'red' ? ` ${styles.active}` : ''}`} onClick={() => { this.onMap('red'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Red</span>
								</button>
								<button className={`${styles.green}${this.map == 'green' ? ` ${styles.active}` : ''}`} onClick={() => { this.onMap('green'); }} unselectable='on'>
									<div className={styles.check}>
										<div />
									</div>
									<span unselectable='on'>Green</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
})