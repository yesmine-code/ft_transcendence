import React from 'react';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import { InvitePeopleMember, InvitePeopleProps, InvitePeopleState } from './index.interface';
import styles from './index.styles.scss';
import ProfilePicture from '@/components/ProfilePicture';
import socket from '@/bundles/socket';


export default withMenu(withUser(class InvitePeople extends React.Component<InvitePeopleProps> {
	protectState: boolean;
	state: InvitePeopleState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			results: []
		};

		this.protectState = false;

		/* handlers */
		this.onSave = this.onSave.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onSelectToInvitation = this.onSelectToInvitation.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	componentDidMount() {
		this.openProtectedState();

		socket.on<InvitePeopleMember[]>('conversation_invitable', (res) => {
			this.setResults(res || []);
		});
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
		const { results } = this.state;

		await data.save(results);

		this.onRemove(e);
	}

	onRemove(e: any) {
		const { remove } = this.props;

		if (remove)
			remove(e);
	}

	onChange(e: React.ChangeEvent<HTMLInputElement>) {
		const query = e.target.value || '';

		const valid = query.length > 0;

		if (valid) {
			socket.emit('invitable_users_channel', { conversation_id: this.conversationID, query });
			return;
		}

		this.setResults([]);
	}

	onSelectToInvitation(props: InvitePeopleMember) {
		const { results } = this.state;

		socket.emit('invite_user_to_channel', { conversation_id: this.conversationID, user_id: props.id });

		this.setResults(results.filter(result => result.id != props.id));
	}


	/* getters */
	private get user() {
		return (this.props.user);
	}

	private get conversationID() {
		return (Number(this.props.data.conversation_id));
	}

	private get loading() {
		return (this.state.loading);
	}


	/* setters */
	setProtectedState(props: Record<string, any>) { if (this.protectState) this.setState(props); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}

	setResults(results: InvitePeopleMember[]) {
		this.setProtectedState({ results });
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { results } = this.state;

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
						<span className={styles.title} unselectable='on'>Invite People</span>
					</div>
				</div>
				<div className={styles.body}>
					<div className={styles.invite}>
						<input name='username' type='text' className={styles.invite_username} placeholder='Type a username' onChange={this.onChange} />
					</div>
					{
						results.length > 0 &&
						<div className={styles.friends}>
							{
								results.map((result) => (
									<button key={result.id} className={styles.friends_item} onClick={() => {this.onSelectToInvitation(result);}}>
										<div className={styles.friends_item_info}>
											<div className={styles.friends_item_avatar}>
												<ProfilePicture src={result.avatar} variant={styles.friends_item_avatar_image} />
											</div>
											<span className={styles.display_name} unselectable='on'>{result.display_name}</span>
											<span className={styles.username} unselectable='on'>{result.username}</span>
										</div>
									</button>
								))
							}
						</div>
					}
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