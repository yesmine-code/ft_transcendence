import React from 'react';

import { FormError } from '@/bundles/fetch';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import Input from '@/components/Input';
import Select from '@/components/Select';

import { ConversationFields, ConversationProps, ConversationState } from './index.interface';
import styles from './index.styles.scss';


export default withMenu(withUser(class Conversation extends React.Component<ConversationProps> {
	protectState: boolean;
	state: ConversationState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			values: {},
			errors: {}
		};

		this.protectState = false;

		/* handlers */
		this.onSave = this.onSave.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.onInformation = this.onInformation.bind(this);
		this.onVisibility = this.onVisibility.bind(this);
		this.onPassword = this.onPassword.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.setValues = this.setValues.bind(this);
		this.setErrors = this.setErrors.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	componentDidMount() {
		this.openProtectedState();

		const { data } = this.props;
		if (data.fields) {
			this.setValues(data.fields);
		}
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

		const is_password = (values.password != undefined) && (values.visibility == 'protected');

		try {
			await data.save({
				name: (values.name || '').replace(/ /gi, '_'),
				visibility: values.visibility || 'public',
				...(is_password ? { password: values.password } : {})
			});
			this.onRemove(e);
		} catch (e: unknown) {
			if (!(e instanceof FormError)) return;

			this.setErrors(e.message, () => {
				if (!(e instanceof FormError)) return;

				if ('password' in e.message) {
					this.onPassword();
				}
			});
		}
	}

	onRemove(e: any) {
		const { remove } = this.props;

		if (remove)
			remove(e);
	}

	onInformation({ name, value }: { name: string; value: string | number; }) {
		this.setValues({ [name]: value });
	}

	onVisibility(props: { name: string; value: string | number; }) {
		if (props.value != 'protected') {
			this.onInformation(props);
			return;
		}
	}
	
	onPassword(callback?: () => void) {
		this.menu.addMenu({
			name: 'conversation_password',
			data: {
				value: this.values.password,
				error: this.errors.password,
				save: async (data: { name: string; value: string | number; }) => {
					this.onInformation(data);
					if (callback) callback();
				}
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

	private get values() {
		return (this.state.values);
	}

	private get errors() {
		return (this.state.errors);
	}

	private get menu() {
		return (this.props.menu);
	}


	/* setters */
	setProtectedState(props: Record<string, any>, callback?: () => void) { if (this.protectState) this.setState(props, callback); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}

	setValues(data: Partial<ConversationFields>) {
		let values: Record<string, any> = {};

		for (const d in data) {
			let value = (data as Record<string, any>)[d];

			values[d] = value;
		}

		this.setProtectedState({
			values: {
				...this.values,
				...values
			},
			errors: {}
		});
	}

	setErrors(data: Record<string, any>, callback?: () => void) {
		this.setProtectedState({
			errors: data
		}, callback);
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { data } = this.props;

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
						{
							(this.values.name || '').length <= 0 &&
							<span className={styles.title} unselectable='on'>{`${data.channelID == undefined ? 'Create' : 'Edit'} channel`}</span>
						}
						{
							(this.values.name || '').length > 0 &&
							<span className={styles.title} unselectable='on'>{`#${(this.values.name || '').replace(/ /gi, '_')}`}</span>
						}
					</div>
					<div className={styles.actions}>
						<button className={styles.save} unselectable="on" onClick={this.onSave}>Save</button>
					</div>
				</div>
				<div className={styles.body}>
					<Input
						name='name'
						type='text'
						variant={styles.conversation_name}
						placeholder='Channel name'
						onChange={this.onInformation}
						value={this.values.name}
						error={this.errors.name} />
					<div className={styles.visibility}>
						<span className={styles.visibility_title} unselectable='on'>Visibility</span>
						<Select
							name='visibility'
							value={this.values.visibility}
							onChange={this.onInformation}
							options={[
								{
									value: 'Public',
									key: 'public'
								},
								{
									value: 'Private',
									key: 'private'
								},
								{
									value: 'Protected',
									key: 'protected',
									action: this.onPassword
								}
							]} />
					</div>
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