import React from 'react';

import fetch, { FormError } from '@/bundles/fetch';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import ProfilePicture from '@/components/ProfilePicture';
import Input from '@/components/Input';

import { ProfileValues, ProfileProps, ProfileState } from './index.interface';
import styles from './index.styles.scss';


export default withMenu(withUser(class Profile extends React.Component<ProfileProps> {
	protectState: boolean;
	state: ProfileState;

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
		this.onUpdate = this.onUpdate.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.onInformation = this.onInformation.bind(this);
		this.onProfilePicture = this.onProfilePicture.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.setValues = this.setValues.bind(this);
		this.setAvatar = this.setAvatar.bind(this);

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
		if (!user.setUser)
			return null;

		try {
			user.setUser(await this.onUpdate());
			this.onRemove(e);
		} catch (e: unknown) {
			if (!(e instanceof FormError)) return;

			this.setProtectedState({ errors: e.message });
		}
	}

	async onUpdate() {
		return await fetch.request.form<Partial<UserData>>('/users/update', this.values);
	}

	onRemove(e: any) {
		const { remove } = this.props;

		if (remove)
			remove(e);
	}

	onInformation({ name, value }: { name: string; value: string }) {
		this.setValues({ [name]: value });
	}

	onProfilePicture() {
		const { menu } = this.props;

		const input = document.createElement('input');
		input.type = 'file';
		input.onchange = (e: any) => {
			this.setLoading(true);

			const files = e.target?.files;

			const file = files[0];
			const read = new FileReader();

			read.onloadend = () => {
				if (typeof read.result != 'string')
					return null;

				this.setLoading(false);

				const image = new Image();
				image.src = read.result;

				menu.addMenu({
					name: 'resize',
					data: {
						image,
						width: 400,
						height: 400,
						save: this.setAvatar
					}
				});
			};

			if (file) read.readAsDataURL(file);
		}

		input.click();
	}


	/* getters */
	private get user() {
		return (this.props.user.user as UserData);
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

	private get avatar() {
		return (this.state.avatar || this.user.avatar);
	}


	/* setters */
	setProtectedState(props: Record<string, any>) { if (this.protectState) this.setState(props); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}

	setValues(data: ProfileValues) {
		if (!this.user)
			return null;

		let values: Record<string, any> = {};

		for (const d in data) {
			const value = (data as Record<string, any>)[d];

			if (value == (this.user as Record<string, any>)[d])
				continue;

			values[d] = value;
		}

		this.setProtectedState({
			values: {
				...this.values,
				...values
			}
		});
	}

	setAvatar(avatar: Blob) {
		const reader = new FileReader();
		reader.readAsDataURL(avatar);
		reader.onloadend = () => {
			this.setProtectedState({ avatar: reader.result });
			this.setValues({ avatar });
		}
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
								<path d="M4.132,46.577L3.425,45.87,45.993,3.308,46.7,4.015Z M3.424,4.038l0.707-.707L46.7,45.89l-0.707.707Z"/>
							</svg>
						</button>
						<span className={styles.title} unselectable='on'>Edit profile</span>
					</div>
					<div className={styles.actions}>
						<button className={styles.save} unselectable="on" onClick={this.onSave}>Save</button>
					</div>
				</div>
				<div className={styles.body}>
					<ProfilePicture
						src={this.avatar}
						variant={styles.profile_picture}
						action={this.onProfilePicture} />
					<Input name='display_name' type='text' variant={styles.display_name} placeholder='Display name' value={this.user.display_name} error={this.errors.display_name} onChange={this.onInformation} />
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