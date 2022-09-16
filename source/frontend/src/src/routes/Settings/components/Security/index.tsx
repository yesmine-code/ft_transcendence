import React from 'react';

import { Menu } from '@/context/menu-context';
import { User } from '@/context/user-context';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import styles from './index.styles.scss';
import fetch from '@/bundles/fetch';


export default withMenu(withUser(class Security extends React.Component<{ menu: Menu, user: User }> {
	protectState: boolean;
	state: {};

	constructor(props: any) {
		super(props);

		this.state = {};

		this.protectState = false;

		/* handlers */
		this.onTwoStepVerificationBase = this.onTwoStepVerificationBase.bind(this);
		this.onTwoStepVerification = this.onTwoStepVerification.bind(this);
		
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

	/* handlers */
	private async onTwoStepVerificationBase() {
		const { user } = this.props;

		const enable = !this.user.two_step_authentication;

		await fetch.request.json('/2fa/update', { enable });

		user.setUser({ two_step_authentication: enable });
	}

	async onTwoStepVerification() {
		const { menu } = this.props;

		if (this.user.phone_number) {
			return await this.onTwoStepVerificationBase();
		}

		menu.addMenu({
			name: 'phone_number',
			data: {
				save: async (data: Record<string, any>) => {
					await this.onTwoStepVerificationBase();
				}
			}
		});
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
					<span className={styles.title} unselectable='on'>2-Step verification</span>
					<div className={styles.section_content}>
						<div
							className={`${styles.section_item}${this.user.two_step_authentication ? ` ${styles.active}` : ''}`}
							onClick={this.onTwoStepVerification}>
							<div className={styles.section_item_header}>
								<span className={styles.title} unselectable='on'>Text message</span>
								<span className={styles.subtitle} unselectable='on'>{`Verification codes are sent ${this.user.phone_number ? `to ${this.user.phone_number} ` : ''}by text message.`}</span>
							</div>
							<div className={styles.section_item_content}>
								<div className={styles.check}>
									<div />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}
}));