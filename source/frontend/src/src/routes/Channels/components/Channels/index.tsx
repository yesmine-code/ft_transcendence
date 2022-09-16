import React from 'react';
import { Link } from 'react-router-dom';

import fetch from '@/bundles/fetch';
import { Scroller } from '@/bundles/scroller';

import { Menu } from '@/context/menu-context';

import protectedRoute from '@/hoc/protectedRoute';
import withParams from '@/hoc/withParams';
import withMenu from '@/hoc/withMenu';

import { Page, Body, Header } from '@/components/document';

import { Channel, ChannelState } from './index.interface';
import styles from './index.styles.scss';
import socket from '@/bundles/socket';


const getDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export default protectedRoute({
	authenticated: true,
	fallback: '/signin'
},
	withParams(
		withMenu(
			class Channels extends React.Component<{ menu: Menu }> {
				state: ChannelState;
				protectState: boolean;
				scroller: Scroller;
				loader: React.RefObject<HTMLDivElement>;

				constructor(props: any) {
					super(props);

					this.state = {
						invitations: undefined,
						channels: undefined
					};

					this.scroller = new Scroller;
					this.loader = React.createRef<HTMLDivElement>();

					this.protectState = false;

					/* handlers */
					this.onScrollConversations = this.onScrollConversations.bind(this);
					this.onScrollInvitations = this.onScrollInvitations.bind(this);
					this.onCreateConversation = this.onCreateConversation.bind(this);

					/* setters */
					this.setProtectedState = this.setProtectedState.bind(this);
					this.setChannels = this.setChannels.bind(this);
					this.setInvitations = this.setInvitations.bind(this);

					/* methods */
					this.openProtectedState = this.openProtectedState.bind(this);
					this.closeProtectedState = this.closeProtectedState.bind(this);
				}

				async componentDidMount() {
					this.openProtectedState();

					await this.onScrollInvitations();
					await this.onScrollConversations();

					this.scroller.start(
						this.loader.current,
						[
							this.onScrollInvitations,
							this.onScrollConversations,
						]
					);
				}

				componentDidCatch(error: any, errorInfo: any) {
					console.error(error, errorInfo);
				}

				componentWillUnmount() {
					this.closeProtectedState();
				}


				/* handlers */
				async onScrollInvitations() {
					const { invitations = [] } = this.state;

					const last = Number(invitations?.at(-1)?.id);

					const data = await fetch.request.json<Channel[]>('/conversations/invitations', { last: Number.isNaN(last) ? undefined : last });

					if (!data)
						return true;

					const target = (data || []);
					this.setInvitations(invitations.concat(target));

					return target.length >= 20;
				}

				async onScrollConversations() {
					const { channels = [] } = this.state;

					const last = Number(channels?.at(-1)?.id);

					const data = await fetch.request.json<Channel[]>('/conversations/channels', { last: Number.isNaN(last) ? undefined : last });

					if (!data)
						return true;

					const target = (data || []);
					this.setChannels(channels.concat(target));

					return target.length >= 20;
				}

				async onCreateConversation() {
					const { menu } = this.props;
					const { channels = [] } = this.state;

					menu.addMenu({
						name: 'conversation',
						data: {
							save: async (data: Record<string, any>) => {
								const result = await fetch.request.json<Channel>('/conversations/create_channel', data);
								if (!result)
									return;

								this.setChannels([result as Channel].concat(channels));
							}
						}
					});
				}

				async onAccept(channel: Channel) {
					const { invitations = [], channels = [] } = this.state;

					socket.emit('accept_invitation_to_channel', { conversation_id: Number(channel.id) });

					this.setInvitations(invitations.filter((request: any) => Number(request.id) != Number(channel.id)));
					this.setChannels([channel].concat(channels));
				}

				async onDecline(channel: Channel) {
					const { invitations } = this.state;

					socket.emit('decline_invitation_to_channel', { conversation_id: Number(channel.id) });

					this.setInvitations((invitations || []).filter((request: any) => Number(request.id) != Number(channel.id)));
				}

				/* setters */
				setProtectedState(props: Record<string, any>, callback?: (() => void)) {
					if (this.protectState) this.setState(props, callback);
				}

				setChannels(channels: Channel[]) {
					this.setProtectedState({ channels });
				}

				setInvitations(invitations: Channel[]) {
					this.setProtectedState({ invitations });
				}


				/* methods */
				openProtectedState() { this.protectState = true; }

				closeProtectedState() { this.protectState = false; }


				render() {
					const { invitations, channels } = this.state;

					return (
						<Page>
							<Header variant={styles.header}>
								<div className={styles.content}>
									<button className={styles.create} onClick={this.onCreateConversation} unselectable='on'>Create channel</button>
								</div>
							</Header>
							<Body variant={styles.body}>
								{
									invitations && invitations.length > 0 &&
									<div className={styles.invitations}>
										<div className={styles.invitations_header}>
											<span unselectable='on'>Invitations</span>
										</div>
										<div className={styles.invitations_content}>
											{
												invitations.map(invitation => (
													<div key={invitation.id} className={styles.item}>
														<span className={styles.item_primary_text} unselectable='on'>{`#${invitation.name}`}</span>
														<div className={styles.action}>
															<button onClick={this.onAccept.bind(this, invitation)} unselectable="on">Accept</button>
															<button onClick={this.onDecline.bind(this, invitation)} unselectable="on">Decline</button>
														</div>
													</div>
												))
											}
										</div>
									</div>
								}
								{
									channels &&
									<>
										<div className={styles.conversations}>
											<div className={styles.conversations_header}>
												<span unselectable='on'>Channels</span>
											</div>
											<div className={styles.conversations_content}>
												{
													(channels.length > 0) &&
													channels.map(conversation => {
														return (
															<Link key={conversation.id} to={`/channels/${conversation.id}`}>
																<div className={styles.item}>
																	<span className={styles.item_primary_text} unselectable='on'>{`#${conversation.name}`}</span>
																	<div className={styles.details}>
																		<span className={styles.item_primary_text} unselectable='on'>{conversation.visibility}</span>
																		<span className={styles.item_primary_text} unselectable='on'>{getDate(conversation.created)}</span>
																	</div>
																</div>
															</Link>
														);
													})
												}
												{
													(channels.length == 0) &&
													<div className={styles.empty}>
														<span unselectable="on">No channels joined yet</span>
													</div>
												}
											</div>
										</div>
									</>
								}
								<div ref={this.loader} />
							</Body>
						</Page>
					);
				}
			}
		)));