import React from 'react';

import { Menu } from '@/context/menu-context';
import { User } from '@/context/user-context';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import styles from './index.styles.scss';


export default withMenu(withUser(class Account extends React.Component<{ menu: Menu, user: User }> {
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

	/* getters */
	private get user(): UserData {
		return (this.props.user.user as UserData);
	}

	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}

	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { menu } = this.props;

		return (
			<div className={styles.container}>
				<div className={styles.section}>
					<span className={styles.title} unselectable='on'>Information</span>
					<div className={styles.section_content}>
						<div
							className={`${styles.section_item}${this.user.phone_number_confirmed ? ` ${styles.active}` : ''}`}
							onClick={menu.addMenu.bind(this, {
								name: 'phone_number'
							})}>
							<div className={styles.section_item_header}>
								<span className={styles.title} unselectable='on'>Phone number</span>
								<span className={styles.subtitle} unselectable='on'>Add a phone number to your account.</span>
							</div>
							{
								this.user.phone_number &&
								<div className={styles.section_item_content}>
									<span className={styles.text} data-verified={`${this.user.phone_number_confirmed}`} unselectable='on'>{this.user.phone_number}</span>
								</div>
							}
						</div>
						<div
							className={styles.section_item}
							onClick={menu.addMenu.bind(this, {
								name: 'username'
							})}>
							<div className={styles.section_item_header}>
								<span className={styles.title} unselectable='on'>Username</span>
								<span className={styles.subtitle} unselectable='on'>Change your username.</span>
							</div>
							<div className={styles.section_item_content}>
								<span className={styles.text} unselectable='on'>{this.user.username}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}));