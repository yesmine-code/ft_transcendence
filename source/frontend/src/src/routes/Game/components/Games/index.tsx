import React from 'react';
import { Link } from 'react-router-dom';

import fetch from '@/bundles/fetch';
import { Scroller } from '@/bundles/scroller';

import { Menu } from '@/context/menu-context';

import protectedRoute from '@/hoc/protectedRoute';
import withParams from '@/hoc/withParams';
import withMenu from '@/hoc/withMenu';

import { Page, Body, Header } from '@/components/document';

import { Game, GamePlayer, GameResult, GameState, GameStatus } from './index.interface';
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
			class Games extends React.Component<{ user: UserData; menu: Menu }> {
				state: GameState;
				protectState: boolean;
				scroller: Scroller;
				loader: React.RefObject<HTMLDivElement>;

				constructor(props: any) {
					super(props);

					this.state = {
						games: undefined
					};

					this.scroller = new Scroller;
					this.loader = React.createRef<HTMLDivElement>();

					this.protectState = false;

					/* handlers */
					this.onScrollGames = this.onScrollGames.bind(this);
					this.onStartGame = this.onStartGame.bind(this);

					/* getters */
					this.getResult = this.getResult.bind(this);

					/* setters */
					this.setProtectedState = this.setProtectedState.bind(this);

					/* methods */
					this.openProtectedState = this.openProtectedState.bind(this);
					this.closeProtectedState = this.closeProtectedState.bind(this);
				}

				componentDidMount() {
					this.openProtectedState();

					this.onScrollGames();

					this.scroller.start(
						this.loader.current,
						[
							this.onScrollGames,
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
				async onScrollGames() {
					const { games = [] } = this.state;

					const last = Number(games?.at(-1)?.id);

					const data = await fetch.request.json<Game[]>('/games/history', { user_id: this.user.id, last: Number.isNaN(last) ? undefined : last });

					if (!data)
						return true;

					const target = (data || []);
					this.setGames(games.concat(target));

					return target.length >= 20;
				}

				async onStartGame() {
					const { menu } = this.props;
					const { games = [] } = this.state;

					menu.addMenu({
						name: 'game',
						data: {
							save: async (data: Record<string, any>) => {}
						}
					});
				}


				/* getters */
				private get user() {
					return (this.props.user as UserData);
				}

				getResult(current: GamePlayer, opponent: GamePlayer) {
					const result: GameResult = {
						status: current.status == GameStatus.WIN ? 'Victory' : 'Defeat',
					};

					if (opponent.status == GameStatus.GAVE_UP) result.message = `${opponent.display_name} gave up before the end!`;
					if (current.status == GameStatus.GAVE_UP) result.message = `You gave up before the end!`;

					return result;
				}

				/* setters */
				setProtectedState(props: Record<string, any>, callback?: (() => void)) {
					if (this.protectState) this.setState(props, callback);
				}

				setGames(games: Game[]) {
					this.setProtectedState({ games });
				}


				/* methods */
				openProtectedState() { this.protectState = true; }

				closeProtectedState() { this.protectState = false; }


				render() {
					const { games } = this.state;

					return (
						<Page>
							<Header variant={styles.header}>
								<div className={styles.content}>
									<button className={styles.create} onClick={this.onStartGame} unselectable='on'>Start game</button>
								</div>
							</Header>
							<Body variant={styles.body}>
								{
									games &&
									<>
										<div className={styles.games}>
											<div className={styles.games_header}>
												<span unselectable='on'>Games</span>
											</div>
											<div className={styles.games_content}>
												{
													(games.length > 0) &&
													games.map((game, index) => {
														const is_first_player = game.first_player.id == this.user.id;
														const current = game[`${is_first_player ? 'first' : 'second'}_player`];
														const opponent = game[`${!is_first_player ? 'first' : 'second'}_player`];

														const result = this.getResult(current, opponent);

														return (
															<Link key={game.id} to={`/games/${game.id}`}>
																<div className={`${styles.item} ${current.status == GameStatus.WIN ? styles.winner : styles.looser}`}>
																	<div className={styles.info}>
																		<div className={styles.main}>
																			<span className={styles.display_name} unselectable='on'>{`${current.display_name}`}</span>
																			<div className={styles.score}>
																				<span unselectable='on'>{`${current.score}`}</span>
																				<span unselectable='on'>:</span>
																				<span unselectable='on'>{`${opponent.score}`}</span>
																			</div>
																			<span className={styles.display_name} unselectable='on'>{`${opponent.display_name}`}</span>
																		</div>
																		<div className={styles.main_details}>
																			{ result.status && <span className={styles.status} unselectable='on'>{result.status}</span> }
																			{ result.message && <span className={styles.about_status} unselectable='on'>{result.message}</span> }
																		</div>
																	</div>
																	<div className={styles.details}>
																		<span className={styles.item_primary_text} unselectable='on'>{getDate(game.finish)}</span>
																	</div>
																</div>
															</Link>
														);
													})
												}
												{
													(games.length == 0) &&
													<div className={styles.empty}>
														<span unselectable="on">No games started yet</span>
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