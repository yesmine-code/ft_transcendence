import React from 'react';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import Input from '@/components/Input';

import { ConversationPasswordProps, ConversationPasswordState } from './index.interface';
import styles from './index.styles.scss';


export default withMenu(withUser(class ConversationPassword extends React.Component<ConversationPasswordProps> {
	protectState: boolean;
	state: ConversationPasswordState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			values: {
				password: this.props.data.value || ''
			},
			errors: {
				password: this.props.data.error || ''
			}
		};

		this.protectState = false;

		/* handlers */
		this.onSave = this.onSave.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.onPassword = this.onPassword.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);

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
	async onSave(e: any) {
		const { data } = this.props;
		const { values } = this.state;

		await data.save({ name: 'password', value: values.password });

		this.onRemove(e);
	}

	onRemove(e: any) {
		const { remove } = this.props;

		if (remove) remove(e);
	}

	onPassword({ name, value }: { name: string; value: string | number }) {
		this.setProtectedState({
			values: {
				[name]: value
			},
			errors: {}
		});
	}


	/* getters */
	private get user() {
		return (this.props.user.user);
	}

	private get values() {
		return (this.state.values);
	}

	private get errors() {
		return (this.state.errors);
	}

	private get loading() {
		return (this.state.loading);
	}


	/* setters */
	setProtectedState(props: Record<string, any>) { if (this.protectState) this.setState(props); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		if (!this.user)
			return null;

		return (
			<div className={`${styles.container}${this.loading ? ` ${styles.loading}` : ''}`}>
				<div className={styles.header}>
					<div className={styles.presentation}>
						<button className={styles.close} onClick={this.onRemove}>
							<svg style={{ width: '100%', height: '100%' }} viewBox="0 0 50 50">
								<path d="M4.132,46.577L3.425,45.87,45.993,3.308,46.7,4.015Z M3.424,4.038l0.707-.707L46.7,45.89l-0.707.707Z" />
							</svg>
						</button>
						<span className={styles.title} unselectable='on'>Edit password</span>
					</div>
					<div className={styles.actions}>
						<button className={styles.save} unselectable="on" onClick={this.onSave}>Save</button>
					</div>
				</div>
				<div className={styles.body}>
					<Input
						name='password'
						type='password'
						variant={styles.conversation_password}
						placeholder='Conversation password'
						value={this.values.password}
						error={this.errors.password}
						onChange={this.onPassword} />
				</div>
				{
					this.loading &&
					<div className={styles.loading}>
						<div />
						<div />
						<div />
						<div />
					</div>
				}
			</div>
		);
	}
}));