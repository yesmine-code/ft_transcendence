import React from 'react';

import socket from '@/bundles/socket';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';
import withNavigate from '@/hoc/withNavigate';

import { GameProps, GameState } from './index.interface';
import styles from './index.styles.scss';


export default withMenu(withUser(withNavigate(class Game extends React.Component<GameProps> {
	protectState: boolean;
	state: GameState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			queuing: true
		};

		this.protectState = false;

		/* handlers */
		this.onRemove = this.onRemove.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
		this.init = this.init.bind(this);
	}

	async componentDidMount() {
		this.openProtectedState();
		await this.init();
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentWillUnmount() {
		this.closeProtectedState();

		if (Number.isInteger(this.gameID) && this.queuing) {
			socket.emit('leave_game', { game_id: this.gameID, conversation_id: this.conversationID, quite: true });
		}
	}

	/* handlers */
	onRemove() {
		const { remove } = this.props;

		if (remove)
			remove();
	}

	/* getters */
	private get navigate() {
		return (this.props.navigate);
	}

	private get remove() {
		return (this.props.remove);
	}

	private get user() {
		return (this.props.user.user);
	}

	private get loading() {
		return (this.state.loading);
	}

	private get queuing() {
		return (this.state.queuing);
	}

	private get opponentID() {
		return (Number(this.props.data.opponent_id) || undefined);
	}

	private get conversationID() {
		return (Number(this.props.data.conversation_id) || undefined);
	}

	private get gameID() {
		return (Number(this.state.game_id) || undefined);
	}


	/* setters */
	setProtectedState(props: Record<string, any>, callback?: () => void) { if (this.protectState) this.setState(props, callback); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}

	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }

	async init() {
		socket.emit('join_game', { opponent_id: this.opponentID, conversation_id: this.conversationID });

		socket.on('game_deleted', ({ id }: { id: number }) => {
			if (id != this.gameID) return;

			this.remove();
		});
		

		socket.on('game_queuing', (data: Record<string, any>) => {
			this.setProtectedState({ game_id: data.game_id, queuing: data.queuing }, () => {
				if (this.queuing) return;

				this.navigate(`/games/${this.gameID}`);
				this.remove();
			});
		});
	}


	render() {
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
					</div>
				</div>
				<div className={styles.body}>
					<span className={styles.message} unselectable='on'>Looking for opponents...</span>
					<div className={styles.loading}>
						<div />
					</div>
				</div>
			</div>
		);
	}
})));