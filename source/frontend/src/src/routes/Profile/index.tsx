import React from 'react';
import { Link } from 'react-router-dom';

import fetch from '@/bundles/fetch';
import socket from '@/bundles/socket';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';
import withParams from '@/hoc/withParams';
import withNavigate from '@/hoc/withNavigate';
import protectedRoute from '@/hoc/protectedRoute';

import { Page, Body, Header } from '@/components/document';
import ProfilePicture from '@/components/ProfilePicture';
import Options from '@/components/Options';

import Components from './components';

import { ProfileBaseProps, ProfileProps, ProfileState } from './index.interface';
import styles from './index.styles.scss';

const ProfileBase = withNavigate(withMenu(({ navigate, menu, page, profile, classname, value, setFriendship }: ProfileBaseProps) => {
	const available = !(profile.friendship == 'BLOCKED' || profile.blocked);

	const action = async (uri: string) => {
		const data = await fetch.request.json(`/connections/${uri}`, { user_id: profile.id });
		if (!data)
			return null;

		setFriendship(data.friendship);
	}

	const dm = async () => {
		const data = await fetch.request.json('/conversations/create_direct_message', { target_id: profile.id });
		if (!data)
			return null;

		navigate(`/direct_messages/${data.conversation_id}`);
	}

	return (
		<>
			<Header variant={styles.header}>
				<div className={styles.content}>
					<div className={styles.presentation}>
						<ProfilePicture src={profile.avatar} variant={styles.profile_picture} />
						<div className={styles.name}>
							<span className={styles.display_name}>{`${profile.display_name}`}</span>
							<span className={styles.username}>{`@${profile.username}`}</span>
						</div>
					</div>
					<div className={styles.actions}>
						{
							!(profile.is_owner || (profile.blocked && profile.friendship != 'BLOCKED')) &&
							<div className={styles.status} data-status={`${profile.status }`}>
								<div />
							</div>
						}
						{
							!(profile.is_owner || profile.friendship == 'DECLINED' || (profile.blocked && profile.friendship != 'BLOCKED')) &&
							<button
								className={`${styles.friend_request}${classname && classname.length ? ` ${classname}` : ''}`}
								onClick={async () => {
									if (!profile.friendship || !['PENDING', 'FRIEND', 'BLOCKED'].includes(profile.friendship))
										await action('add_friend');
									else if (profile.friendship == 'BLOCKED')
										await action('remove_block');
									else
										await action('remove_friend');
								}}
								unselectable="on">
								{value}
							</button>
						}
						<Options
							options={[
								(profile.friendship == 'BLOCKED' || profile.is_owner)
								? undefined
								: {
									value: 'Block',
									action: async () => { await action('add_block'); }
								},
								(profile.friendship == 'BLOCKED' || profile.is_owner)
								? undefined
								: {
									value: 'Message',
									action: dm
								},
								!profile.is_owner
								? undefined
								: {
									value: 'Edit',
									action: menu.addMenu.bind(this, {
										name: 'profile'
									})
								}
							]} />
					</div>
				</div>
				{
					available &&
					<div className={styles.footer}>
						<Link className={`${styles.item}${page == 'matches' ? ` ${styles.active}` : ''}`} to={`/${profile.username}`} unselectable="on">Matches</Link>
						<Link className={`${styles.item}${page == 'levels' ? ` ${styles.active}` : ''}`} to={`/${profile.username}/levels`} unselectable="on">Levels</Link>
						<Link className={`${styles.item}${page == 'achievements' ? ` ${styles.active}` : ''}`} to={`/${profile.username}/achievements`} unselectable="on">Achievements</Link>
					</div>
				}
			</Header>
			<Body variant={styles.body}>
				<Components available={available} page={page} profile={profile} />
			</Body>
		</>
	);
}));


export default protectedRoute({ authenticated: true, fallback: '/signin' }, withParams(withUser(class Profile extends React.Component<ProfileProps> {
	protectState: boolean;
	state: ProfileState;

	constructor(props: any) {
		super(props);

		this.state = {
			username: this.username
		};

		this.protectState = false;
		
		/* handlers */
		this.onJoinProfile = this.onJoinProfile.bind(this);
		this.onLeaveProfile = this.onLeaveProfile.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setClassName = this.setClassName.bind(this);
		this.setValue = this.setValue.bind(this);
		this.setProfile = this.setProfile.bind(this);
		this.setFriendship = this.setFriendship.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	async componentDidMount() {
		this.openProtectedState();

		await this.onJoinProfile();
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentDidUpdate() {
		if (this.state.username != this.username) {
			this.setProtectedState({
				username: this.username
			}, async () => {
				await this.onLeaveProfile();
				await this.onJoinProfile();
			});
		}
	}

	async componentWillUnmount() {
		this.closeProtectedState();

		await this.onLeaveProfile();
	}

	/* handlers */
	async onJoinProfile() {
		const result = await fetch.request.json('/users/profile', { username: this.username });
		if (!result)
			return null;

		socket.emit('join_profile', { user_id: result.id });
		socket.on('profile_data', (data) => {
			this.setProfile({ status: data.status });
		});

		this.setFriendship(result.friendship);
		this.setProfile(result);
	}

	async onLeaveProfile() {
		const profile = this.state.profile;

		if (profile)
			socket.emit('leave_profile', { user_id: profile.id });
	}

	/* getters */
	private get user(): UserData {
		return ((this.props.user?.user || {}) as UserData);
	}

	private get page(): string {
		return (this.props.params.page || 'matches');
	}

	private get username(): string {
		return (this.props.params.username);
	}

	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}

	setClassName(classname: string = '') {
		this.setProtectedState({
			classname
		});
	}

	setValue(value: string = '') {
		this.setProtectedState({
			value
		});
	}

	setProfile(value?: Record<string, any>) {
		const { profile } = this.state;

		this.setProtectedState({
			profile: {
				...(profile || {}),
				...(value || {})
			}
		})
	}

	setFriendship(props: any) {
		switch (props) {
			case 'PENDING':
				this.setClassName(styles.pending);
				this.setValue('cancel request');
				break;
			case 'FRIEND':
				this.setClassName(styles.friend);
				this.setValue('remove friend');
				break;
			case 'DECLINED':
				this.setClassName();
				this.setValue();
				break;
			case 'BLOCKED':
				this.setClassName(styles.blocked);
				this.setValue('unblock');
				break;
			default:
				this.setClassName();
				this.setValue('add friend');
				break;
		}

		this.setProfile({
			friendship: props
		});
	}

	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { profile, classname, value } = this.state;

		const found = profile && !!Object.keys(profile).length;

		return (
			<Page>
				{
					profile &&
					<>
						{
							found &&
							<ProfileBase
								page={this.page}
								value={value}
								profile={profile.is_owner ? { ...profile, ...this.user } : profile}
								classname={classname}
								setFriendship={this.setFriendship} />
						}
						{
							!found &&
							<div className={styles.error}>
								<div className={styles.error_content}>
									<span className={styles.title} unselectable='on'>Oops!</span>
									<span className={styles.message} unselectable='on'>The page you are looking for cannot be found.</span>
								</div>
							</div>
						}
					</>
				}
			</Page>
		);
	}
})));