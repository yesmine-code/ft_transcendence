import React from 'react';

import fetch, { FormError } from '@/bundles/fetch';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import Input from '@/components/Input';

import { UsernameFields, UsernameProps, UsernameState } from './index.interface';
import styles from './index.styles.scss';


export default withMenu(withUser(class Username extends React.Component<UsernameProps> {
	protectState: boolean;
	state: UsernameState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			values: {
				username: ''
			},
			errors: {}
		};

		this.protectState = false;

		/* handlers */
		this.onSave = this.onSave.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.onValues = this.onValues.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.setErrors = this.setErrors.bind(this);

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
		const { user } = this.props;
		const { values } = this.state;

		try {
			await fetch.request.json('/users/username', values);
			user.setUser({ username: values.username });
			this.onRemove(e);
		} catch (e: unknown) {
			if (!(e instanceof FormError)) return;

			this.setErrors(e.message);
		}
	}

	onRemove(e: any) {
		const { remove } = this.props;

		if (remove) remove(e);
	}

	onValues({ name, value }: { name: string; value: string | number }) {
		const { values } = this.state;

		this.setProtectedState({
			values: {
				...values,
				[name]: value
			}
		});
	}


	/* getters */
	private get user() {
		return (this.props.user.user);
	}

	private get loading() {
		return (this.state.loading);
	}


	/* setters */
	setProtectedState(props: Record<string, any>) { if (this.protectState) this.setState(props); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}

	setErrors(props: Partial<UsernameFields>) {
		const { errors } = this.state;

		this.setProtectedState({
			errors: {
				...errors,
				...props
			}
		});
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { errors } = this.state;

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
						<span className={styles.title} unselectable='on'>Edit username</span>
					</div>
					<div className={styles.actions}>
						<button className={styles.save} unselectable="on" onClick={this.onSave}>Save</button>
					</div>
				</div>
				<div className={styles.body}>
					<Input
						name='username'
						type='text'
						variant={styles.username}
						placeholder='Username'
						onChange={this.onValues}
						error={errors.username} />
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