import React from 'react';

import socket from '@/bundles/socket';
import Game from '@/bundles/game';

import protectedRoute from '@/hoc/protectedRoute';

import { GameProps, GameState } from './index.interface';
import styles from './index.styles.scss';


export default protectedRoute({ authenticated: true, fallback: '/' }, class extends React.Component<GameProps> {
	state: GameState;
	protectState: boolean;
	canvasElement: React.RefObject<HTMLCanvasElement>;
	game?: Game;

	constructor(props: GameProps | Readonly<GameProps>) {
		super(props);

		this.state = {
			deleted: false,
			connected: false
		};

		this.protectState = false;

		this.game = new Game();

		this.canvasElement = React.createRef<HTMLCanvasElement>();

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
		this.init = this.init.bind(this);
	}

	async componentDidMount() {
		this.openProtectedState();
		this.init();
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentWillUnmount() {
		this.closeProtectedState();

		if (this.game) this.game.leaveGame();
	}

	/* getters */
	private get gameID() {
		return (Number(this.props.gameID));
	}

	private get user() {
		return (this.props.user as UserData);
	}


	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }

	init() {
		socket.on('game_deleted', ({ id }: { id: number }) => {
			if (id != this.gameID) return;

			this.setProtectedState({
				deleted: true
			});
		});

		const canvas = this.canvasElement.current;
		if (!canvas || !this.game) return;
		
		this.game.init({
			id: this.gameID,
			canvas,
			user: this.user
		});
	}


	render() {
		const { deleted } = this.state;

		return (
			<div className={styles.container}>
				<div className={styles.content}>
					{
						!deleted &&
						<div className={styles.canvas}>
							<canvas ref={this.canvasElement} width="800" height="600"></canvas>
						</div>
					}
					{
						deleted &&
						<div className={styles.error}>
							<div className={styles.error_content}>
								<span className={styles.title} unselectable='on'>Oops!</span>
								<span className={styles.message} unselectable='on'>The game you are looking for hasn't started yet.</span>
							</div>
						</div>
					}
				</div>
			</div>
		);
	}
});