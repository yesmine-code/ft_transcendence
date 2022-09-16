import React from 'react';
import { Link, NavigateFunction } from 'react-router-dom';

import socket from '@/bundles/socket';
import fetch from '@/bundles/fetch';
import { Scroller } from '@/bundles/scroller';

import protectedRoute from '@/hoc/protectedRoute';
import withParams from '@/hoc/withParams';
import withUser from '@/hoc/withUser';
import withMenu from '@/hoc/withMenu';

import { User } from '@/context/user-context';
import { Menu } from '@/context/menu-context';

import { Page, Body, Header } from '@/components/document';
import ProfilePicture from '@/components/ProfilePicture';
import TextArea from '@/components/TextArea';
import Options from '@/components/Options';

import { GameMessage, Message, MessageInfo, MessageState, MessageUser } from './index.interface';
import styles from './index.styles.scss';


const isMinuteClose = (date1: string, date2: string) => {
	return ((new Date(date1).getTime() - new Date(date2).getTime()) / 60000) <= 1;
}

const getDate = (date: string) => {
	return new Date(date).toLocaleDateString("en-US", {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

const getTime = (date: string) => {
	return (new Date(date)).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit'
	});
}

export default protectedRoute({
	authenticated: true,
	fallback: '/signin'
},
	withParams(
		withUser(
			withMenu(
				class Conversations extends React.Component<{ user: User; menu: Menu; navigate: NavigateFunction; conversationID: string; }> {
					state: MessageState;
					protectState: boolean;
					scroller: Scroller;
					loader: React.RefObject<HTMLDivElement>;
					scroll: React.RefObject<HTMLDivElement>;
					scroll_content: React.RefObject<HTMLDivElement>;

					constructor(props: any) {
						super(props);

						this.state = {
							writing: undefined,
							messages: [],
							quite: false
						};

						this.scroller = new Scroller;
						this.loader = React.createRef<HTMLDivElement>();
						this.scroll = React.createRef<HTMLDivElement>();
						this.scroll_content = React.createRef<HTMLDivElement>();

						this.protectState = false;

						/* handlers */
						this.onJoinConversation = this.onJoinConversation.bind(this);
						this.onLeaveConversation = this.onLeaveConversation.bind(this);
						this.onCloseConversation = this.onCloseConversation.bind(this);
						this.onInviteToPlay = this.onInviteToPlay.bind(this);
						this.onScroll = this.onScroll.bind(this);
						this.onInput = this.onInput.bind(this);
						this.onChange = this.onChange.bind(this);
						this.onWriting = this.onWriting.bind(this);
						this.onResponse = this.onResponse.bind(this);

						/* setters */
						this.setProtectedState = this.setProtectedState.bind(this);
						this.setMessage = this.setMessage.bind(this);

						/* methods */
						this.openProtectedState = this.openProtectedState.bind(this);
						this.closeProtectedState = this.closeProtectedState.bind(this);
						this.appendMessages = this.appendMessages.bind(this);
						this.deleteMessage = this.deleteMessage.bind(this);
						this.initMessages = this.initMessages.bind(this);
						this.gameStarted = this.gameStarted.bind(this);
					}

					componentDidMount() {
						this.openProtectedState();

						this.onJoinConversation(() => {
							socket.on<Message>('message', this.appendMessages);
							socket.on<{ id: number }>('game_deleted', this.deleteMessage);
							socket.on<{ id: number; created: string; }>('game_started', this.gameStarted);
							this.scroller.start(this.loader.current, this.onScroll);
						});
					}

					componentDidCatch(error: any, errorInfo: any) {
						console.error(error, errorInfo);
					}

					async componentWillUnmount() {
						this.closeProtectedState();

						await this.onLeaveConversation();
					}


					/* handlers */
					onJoinConversation(callback?: () => void) {
						const { info, password } = this.state;

						socket.emit('join_conversation', { conversation_id: this.conversationID, password });

						socket.on<MessageInfo>('conversation_data', (data) => {
							if (data.members && this.user) {
								const quite = !data.members.filter(member => member.id == this.user.id).length;
								if (quite) return this.props.navigate('/direct_messages');
							}

							this.setProtectedState({
								info: {
									...(data || {}),
									...(info || {})
								}
							}, callback);
						});
					}

					async onLeaveConversation() {
						return new Promise((resolve, _) => {
							socket.emit('leave_conversation', { conversation_id: this.conversationID, quite: this.state.quite });
							socket.on('conversation_left', (data) => {
								resolve(data);
							});
						});
					}
					async onCloseConversation() {
						this.setProtectedState({
							quite: true
						}, () => {
							this.props.navigate('/direct_messages');
						});
					}

					async onScroll() {
						const { messages } = this.state;

						const last = Number(messages?.at(0)?.id);

						const data = await fetch.request.json<Message[]>('/message', {
							conversation_id: this.conversationID,
							last
						});

						if (!data)
							return true;

						const source = (messages || []);
						const target = (data || []);

						this.setMessage(target.concat(source), async () => {
							const scroll = this.scroll.current;
							const scroll_content = this.scroll_content.current;
							if (scroll && scroll_content) {
								const children = ([].slice.call(scroll_content.children) as HTMLDivElement[]);

								let total = 0;

								let borns: HTMLDivElement[] = [];

								for (const child in children) {
									const index = Number(child);
									const element = children[index];

									total += (index > 0 ? children[index - 1].getBoundingClientRect().height : 0);

									const born = !element.getAttribute('style');

									element.style.transform = `translateY(${total}px)`;

									if (total > scroll_content.getBoundingClientRect().height) {
										scroll_content.style.minHeight = `${total}px`;
									}

									if (born) {
										borns.push(element);
									}

									if (!source.length) {
										scroll.scrollTop = scroll_content.scrollHeight;
									}
								}

								await new Promise(r => setTimeout(r, 50));

								for (const born in borns) {
									const index = Number(born);
									borns[borns.length - index - 1].classList.add(styles.show);
									await new Promise(r => setTimeout(r, 10));
								}
							}
						});

						return target.length >= 20;
					}

					onChange({ value }: { name: string; value: string; }) {
						if (!value.trim().length) return;

						socket.emit('add_message', {
							conversation_id: this.conversationID,
							message: value
						});
					}

					onInput() {
						const { writing } = this.state;

						if (writing)
							clearTimeout(writing);

						this.setProtectedState({
							writing: setTimeout(this.onWriting, 1000)
						}, () => {
							if (writing != undefined)
								return null;

							socket.emit('add_conversation_action', {
								conversation_id: this.conversationID,
								action: 'writing'
							});
						});
					}

					onWriting() {
						const { writing } = this.state;

						if (writing)
							clearTimeout(writing);

						this.setProtectedState({ writing: undefined }, () => {
							socket.emit('add_conversation_action', {
								conversation_id: this.conversationID,
								action: 'none'
							});
						});
					}

					onResponse(game: GameMessage, response: 'accept' | 'refuse') {
						if (this.user.id != game.target.id) return;

						socket.emit('game_invitation', { game_id: game.id, response });

						socket.on('game_queuing', (data: Record<string, any>) => {
							this.navigate(`/games/${data.game_id}`);
						});
					}

					onInviteToPlay(member: MessageUser) {
						this.menu.addMenu({
							name: 'game',
							data: {
								opponent_id: member.id,
								conversation_id: this.conversationID,
								save: async (data: Record<string, any>) => {}
							}
						});
					}


					/* getters */
					private get user() {
						return (this.props.user.user as UserData);
					}

					private get menu() {
						return (this.props.menu as Menu);
					}

					private get navigate() {
						return (this.props.navigate);
					}

					private get conversationID() {
						return Number(this.props.conversationID);
					}


					/* setters */
					setProtectedState(props: Record<string, any>, callback?: (() => void)) {
						if (this.protectState) this.setState(props, callback);
					}

					setMessage(messages: Message[], callback?: () => void) {
						this.setProtectedState({ messages }, callback);
					}

					appendMessages(message: Message) {
						const { messages = [] } = this.state;

						this.setProtectedState({
							messages: messages.concat([message])
						}, this.initMessages);
					}

					deleteMessage({ id }: { id: number }) {
						const { messages = [] } = this.state;

						this.setProtectedState({
							messages: messages.filter((message) => message.game && (message.game.id != id))
						}, this.initMessages);
					}

					gameStarted({ id, created }: { id: number; created: string; }) {
						const { messages = [] } = this.state;

						this.setProtectedState({
							messages: messages.map((message) => {
								if (message.game && message.game.id == id) {
									message.game.created = created;
								}

								return message;
							})
						}, this.initMessages);
					}

					async initMessages() {
						const scroll = this.scroll.current;
						const scroll_content = this.scroll_content.current;
						if (scroll && scroll_content) {
							const children = ([].slice.call(scroll_content.children) as HTMLDivElement[]);

							let total = 0;

							let borns: HTMLDivElement[] = [];

							for (const child in children) {
								const index = Number(child);
								const element = children[index];

								total += (index > 0 ? children[index - 1].getBoundingClientRect().height : 0);

								const born = !element.getAttribute('style');

								element.style.transform = `translateY(${total}px)`;

								if (total > scroll_content.getBoundingClientRect().height) {
									scroll_content.style.minHeight = `${total}px`;
								}

								if (born) {
									borns.push(element);
								} else {
									element.classList.add(styles.show);
								}

								scroll.scrollTop = scroll_content.scrollHeight;
							}

							await new Promise(r => setTimeout(r, 50));

							for (const born in borns) {
								const index = Number(born);
								borns[borns.length - index - 1].classList.add(styles.show);
								await new Promise(r => setTimeout(r, 10));
							}
						}
					}


					/* methods */
					openProtectedState() { this.protectState = true; }

					closeProtectedState() { this.protectState = false; }


					render() {
						const { menu } = this.props;
						const { info, messages } = this.state;

						const user = this.user;

						if (!user || !info || !info.members)
							return null;

						const writing = info.members.filter((member) => member.action == 'writing' && member.id != user.id);

						return (
							<Page>
								<Header variant={styles.header}>
									<span className={styles.title} unselectable='on'>Direct message</span>
									<Options
										orientation={'horizontal'}
										options={[
											{
												value: 'Close conversation',
												action: this.onCloseConversation
											}
										]} />
								</Header>
								<Body variant={styles.body}>
									<div className={styles.content}>
										<div ref={this.scroll} className={styles.scroll}>
											<div ref={this.loader} />
											<div ref={this.scroll_content} className={styles.scroll_content} style={{ minHeight: '0px' }}>
												{
													messages.map((message, index) => {
														const before = (index > 0)
															&& (messages[index - 1].author.id == message.author.id)
															&& (isMinuteClose(message.date, messages[index - 1].date));

														const after = (index + 1 < messages.length)
															&& (messages[index + 1].author.id == message.author.id)
															&& (isMinuteClose(messages[index + 1].date, message.date));

														return (
															<div key={message.id} className={`${styles.item}${before ? ` ${styles.before}` : ''}${after ? ` ${styles.after}` : ''}`}>
																{
																	(!index || (getDate(messages[index - 1].date) !== getDate(message.date))) &&
																	<div className={styles.item_date}>
																		<div />
																		<span unselectable='on'>{getDate(message.date)}</span>
																		<div />
																	</div>
																}
																<div className={styles.item_content}>
																	{
																		!before &&
																		<Link
																			to={`/${message.author.username}`}
																			unselectable='on'>
																			<ProfilePicture
																				src={message.author.avatar}
																				variant={styles.profile_picture} />
																		</Link>
																	}
																	{
																		before &&
																		<div className={styles.time}>
																			<span unselectable='on'>{getTime(message.date)}</span>
																		</div>
																	}
																	<div className={styles.text}>
																		{
																			!before &&
																			<div className={styles.presentation}>
																				<Link
																					to={`/${message.author.username}`}
																					className={styles.display_name}
																					unselectable='on'>
																					{`${message.author.display_name} (${message.author.username})`}
																				</Link>
																				<span className={styles.time} unselectable='on'>{getTime(message.date)}</span>
																			</div>
																		}
																		{
																			!message.game &&
																			<span className={styles.value}>{message.value}</span>
																		}
																		{
																			message.game &&
																			<div className={styles.invitation}>
																				{
																					this.user.id == message.game.target.id &&
																					<>
																						<span className={styles.value}>{`${message.author.display_name} invit${message.game.created ? 'ed' : 'es'} you to play Pong.`}</span>
																						{
																							!message.game.created &&
																							<div className={styles.response}>
																								<button onClick={this.onResponse.bind(this, message.game, 'accept')} unselectable='on'>Accept</button>
																								<button onClick={this.onResponse.bind(this, message.game, 'refuse')} unselectable='on'>Refuse</button>
																							</div>
																						}
																					</>
																				}
																				{
																					this.user.id != message.game.target.id &&
																					<span className={styles.value}>{`${message.author.display_name} invites ${message.game.target.display_name} to play Pong.`}</span>
																				}
																			</div>
																		}
																	</div>
																</div>
															</div>
														);
													})
												}
											</div>
											{
												!messages.length &&
												<div className={styles.empty}>
													<span unselectable="on">No messages posted yet</span>
												</div>
											}
										</div>
										{
											!(info.role == 'muted') &&
											<div className={styles.footer}>
												{
													(writing.length > 0) &&
													<div className={styles.actions}>
														<span className={styles.username} unselectable='on'>{`@${writing[0].username}`}</span>
														{
															(writing.length > 1) &&
															<>
																<span unselectable='on'>and</span>
																<span className={styles.username} unselectable='on'>{writing.length == 2 ? `@${writing[1].username}` : `${writing.length - 1} others`}</span>
															</>
														}
														<span unselectable='on'>{`${writing.length > 1 ? 'are' : 'is'} typing...`}</span>
													</div>
												}
												<TextArea name='message' variant={styles.message} onInput={this.onInput} onChange={this.onChange} placeholder='Type a message' />
											</div>
										}
									</div>
									<div className={styles.members}>
										{
											info.members.length > 0 &&
											<>
												<div className={styles.members_content}>
													<div className={styles.members_list}>
														{
															info.members.map((member, index) => (
																<div key={member.id} className={styles.members_item} data-status={`${member.status}`} style={{ transform: `translateY(${index * 46}px)` }}>
																	<Link to={`/${member.username}`} className={styles.members_item_link} unselectable="on">
																		<div className={styles.members_item_content}>
																			<div className={styles.members_item_avatar}>
																				<ProfilePicture src={member.avatar} variant={styles.members_item_avatar_image} />
																				{
																					member.status != "NONE" &&
																					<div className={`${styles.members_item_status}${member.action == 'writing' ? ` ${styles.writing}` : ''}`}>
																						<div />
																						<div />
																						<div />
																					</div>
																				}
																			</div>
																			<span className={styles.members_item_username} unselectable='on'>{member.username}</span>
																		</div>
																	</Link>
																	{
																		this.user.id != member.id && member.status != "NONE" &&
																		<Options
																			orientation={'vertical'}
																			options={[
																				{
																					value: 'Invite to play',
																					action: this.onInviteToPlay.bind(this, member)
																				}
																			]}>
																		</Options>
																	}
																</div>
															))
														}
													</div>
												</div>
											</>
										}
									</div>
								</Body>
							</Page>
						);
					}
				}
			))));