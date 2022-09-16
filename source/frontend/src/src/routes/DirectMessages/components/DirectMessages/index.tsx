import React from 'react';
import { Link } from 'react-router-dom';

import fetch from '@/bundles/fetch';
import { Scroller } from '@/bundles/scroller';

import { Menu } from '@/context/menu-context';

import protectedRoute from '@/hoc/protectedRoute';
import withParams from '@/hoc/withParams';
import withMenu from '@/hoc/withMenu';

import { Page, Body, Header } from '@/components/document';

import { DirectMessage, DirectMessagesState } from './index.interface';
import styles from './index.styles.scss';


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
			class DirectMessages extends React.Component<{ menu: Menu }> {
				state: DirectMessagesState;
				protectState: boolean;
				scroller: Scroller;
				loader: React.RefObject<HTMLDivElement>;

				constructor(props: any) {
					super(props);

					this.state = {
						direct_messages: undefined
					};

					this.scroller = new Scroller;
					this.loader = React.createRef<HTMLDivElement>();

					this.protectState = false;

					/* handlers */
					this.onScrollDirectMessages = this.onScrollDirectMessages.bind(this);

					/* setters */
					this.setProtectedState = this.setProtectedState.bind(this);
					this.setDirectMessages = this.setDirectMessages.bind(this);

					/* methods */
					this.openProtectedState = this.openProtectedState.bind(this);
					this.closeProtectedState = this.closeProtectedState.bind(this);
				}

				componentDidMount() {
					this.openProtectedState();

					this.onScrollDirectMessages();

					this.scroller.start(
						this.loader.current,
						[
							this.onScrollDirectMessages,
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
				async onScrollDirectMessages() {
					const { direct_messages = [] } = this.state;

					const last = Number(direct_messages?.at(-1)?.id);

					const data = await fetch.request.json<DirectMessage[]>('/conversations/direct_messages', { last: Number.isNaN(last) ? undefined : last });

					if (!data)
						return true;

					const target = (data || []);
					this.setDirectMessages(direct_messages.concat(target));

					return target.length >= 20;
				}

				/* setters */
				setProtectedState(props: Record<string, any>, callback?: (() => void)) {
					if (this.protectState) this.setState(props, callback);
				}

				setDirectMessages(direct_messages: DirectMessage[]) {
					this.setProtectedState({ direct_messages });
				}


				/* methods */
				openProtectedState() { this.protectState = true; }

				closeProtectedState() { this.protectState = false; }


				render() {
					const { direct_messages } = this.state;

					return (
						<Page>
							<Header variant={styles.header}>
								<div className={styles.content}>
									<span unselectable='on'>Direct messages</span>
								</div>
							</Header>
							<Body variant={styles.body}>
								{
									direct_messages &&
									<>
										<div className={styles.conversations}>
											<div className={styles.conversations_content}>
												{
													(direct_messages.length > 0) &&
													direct_messages.map(direct_message => {
														return (
															<Link key={direct_message.id} to={`/direct_messages/${direct_message.id}`}>
																<div className={styles.item}>
																	<span className={styles.item_primary_text} unselectable='on'>{`@${direct_message.name}`}</span>
																	<div className={styles.details}>
																		<span className={styles.item_primary_text} unselectable='on'>{getDate(direct_message.created)}</span>
																	</div>
																</div>
															</Link>
														);
													})
												}
												{
													(direct_messages.length == 0) &&
													<div className={styles.empty}>
														<span unselectable="on">No direct messages yet.</span>
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