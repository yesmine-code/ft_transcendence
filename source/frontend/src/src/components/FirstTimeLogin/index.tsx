import React from 'react';

import fetch, { FormError } from '@/bundles/fetch';

import withUser from '@/hoc/withUser';
import withMenu from '@/hoc/withMenu';
import withNavigate from '@/hoc/withNavigate';

import Input from '@/components/Input';
import ProfilePicture from '@/components/ProfilePicture';

import { AboutYourselfFields, AboutYourselfProps, AboutYourselfState } from './index.interface';
import styles from './index.styles.scss';
import { User } from '@/context/user-context';

const AboutYourself = withUser(withMenu(withNavigate(class AboutYourself extends React.Component<AboutYourselfProps> {
	state: AboutYourselfState;
	protectState: boolean;

	constructor(props: AboutYourselfProps | Readonly<AboutYourselfProps>) {
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
			this.navigation('/');
		} catch (e: unknown) {
			if (!(e instanceof FormError)) return;

			this.setProtectedState({ errors: e.message });
		}
	}

	async onUpdate() {
		return await fetch.request.form<Partial<UserData>>('/users/first_login', this.values);
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

	private get navigation() {
		return (this.props.navigate);
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

	setValues(data: AboutYourselfFields) {
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
		return (
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.title}>
						<span className={styles.text} unselectable='on'>Tell us about you</span>
						<button className={styles.save} unselectable="on" onClick={this.onSave}>Save</button>
					</div>
				</div>
				<div className={styles.body}>
					<div className={styles.profile_picture}>
						<span className={styles.profile_picture_title} unselectable='on'>Avatar</span>
						<ProfilePicture
							src={this.avatar}
							variant={styles.profile_picture_content}
							action={this.onProfilePicture} />
					</div>
					<Input required name='display_name' type='text' variant={styles.display_name} placeholder='Display name' value={this.user.display_name} error={this.errors.display_name} onChange={this.onInformation} />
				</div>
				<div className={styles.footer}>
					<span unselectable='on'>These fields are mandatory.</span>
				</div>
			</div>
		);
	}
})));

export default withUser(({ user, children }: { user: User, children: any }) => {
	return (user.user?.isFirstLogin) ? <AboutYourself /> : children;
});