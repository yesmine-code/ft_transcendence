import { GameState, Player, Ball, GameLoading, PlayerStatus, GameMap } from './game.interface';
import socket from './socket';


export default class Game {
	static PLAYER_HEIGHT = 100;
	static PLAYER_WIDTH = 7;
	static PLAYER_MARGIN = 2;
	static MAX_SPEED = 10;

	canvas?: HTMLCanvasElement;
	gameID?: number;
	user?: UserData;

	state: GameState;

	constructor() {
		this.canvas = undefined;
		this.state = {
			speed: {
				ratio: 0.75
			},
			ball: {
				r: 7,
				x: 0,
				y: 0,
				speed: {
					x: 0,
					y: 0
				}
			},
			loading: 'Loading...',
			map: 'black',
			is_engine: false,
			is_player: false,
			connected: false
		};

		this.play = this.play.bind(this);
		this.draw = this.draw.bind(this);
		this.changeDirection = this.changeDirection.bind(this);
		this.playerMove = this.playerMove.bind(this);
		this.joinGame = this.joinGame.bind(this);
		this.leaveGame = this.leaveGame.bind(this);
		this.onPlayerMove = this.onPlayerMove.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.stop = this.stop.bind(this);
		this.collide = this.collide.bind(this);
		this.ballMove = this.ballMove.bind(this);
		this.reset = this.reset.bind(this);
		this.init = this.init.bind(this);
	}


	public get first_player(): Player {
		return (this.state.first_player as Player);
	}

	public set first_player(player: Partial<Player>) {
		this.state.first_player = {
			...(this.state.first_player || {}),
			...(player || {} as Player)
		} as Player;
	}

	public get second_player(): Player {
		return (this.state.second_player as Player);
	}

	public set second_player(player: Partial<Player>) {
		this.state.second_player = {
			...(this.state.second_player || {}),
			...(player || {} as Player)
		} as Player;
	}

	private get ball(): Ball {
		return (this.state.ball as Ball);
	}

	private set ball(ball: Partial<Ball>) {
		this.state.ball = {
			...(this.state.ball || {}),
			...(ball || {} as Ball)
		} as Ball;
	}
	
	public get connected() {
		return (this.state.connected);
	}

	public set connected(value: Boolean) {
		this.state.connected = value;
	}

	public get animation() {
		return (this.state.animation);
	}

	public set animation(value: number | undefined) {
		this.state.animation = value;
	}

	private get is_engine() {
		return this.state.is_engine;
	}

	private set is_engine(value: Boolean | undefined) {
		this.state.is_engine = !!value;
	}

	private get is_player() {
		return this.state.is_player;
	}

	private set is_player(value: Boolean | undefined) {
		this.state.is_player = !!value;
	}

	private get map() {
		return this.state.map;
	}

	private set map(value: GameMap | undefined) {
		this.state.map = value || 'black';
	}

	private get loading() {
		return this.state.loading;
	}

	private set loading(value: GameLoading | undefined) {
		if (this.state.loading == 'Game over') return;

		this.state.loading = value;
	}


	draw() {
		if (!this.canvas) return;

		const first_player = this.first_player && typeof this.first_player.score == 'number';
		const second_player = this.second_player && typeof this.second_player.score == 'number';
		if (!first_player || !second_player) return;

		const context = this.canvas.getContext('2d');
		if (!context) return;

		const white = this.loading ? '#818181' : 'white';

		switch (this.map) {
			case 'blue':
				context.fillStyle = '#2b1cff';
				break;
			case 'green':
				context.fillStyle = '#18a200';
				break;
			case 'red':
				context.fillStyle = '#fc3030';
				break;
			default:
				context.fillStyle = '#191c1e';
				break;
		}

		context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		context.beginPath();
		context.strokeStyle = white;
		context.lineWidth = 3;
		context.setLineDash([10, 5]);
		context.moveTo(this.canvas.width / 2, 0);
		context.lineTo(this.canvas.width / 2, this.canvas.height);
		context.stroke();

		context.font = "30px Arial";
		context.fillStyle = white;
		context.textAlign = "center";
		context.fillText(`${this.first_player.display_name}`, this.canvas.width / 4, 50);
		context.fillText(`${this.first_player.score}`, this.canvas.width / 4, 100);
		context.fillText(`${this.second_player.display_name}`, (this.canvas.width / 4) * 3, 50);
		context.fillText(`${this.second_player.score}`, (this.canvas.width / 4) * 3, 100);

		if (typeof this.first_player.y == 'number' && typeof this.second_player.y == 'number') {
			context.fillStyle = white;
			context.fillRect(2, this.first_player.y, Game.PLAYER_WIDTH, Game.PLAYER_HEIGHT);
			context.fillRect(this.canvas.width - Game.PLAYER_WIDTH - 2, this.second_player.y, Game.PLAYER_WIDTH, Game.PLAYER_HEIGHT);
		}

		if (!this.loading) {
			context.beginPath();
			context.fillStyle = 'white';
			context.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2, false);
			context.fill();
		} else {
			const footer = this.first_player.status || this.first_player.status;

			context.font = "80px Arial";
			context.fillStyle = "white";
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.fillText(this.loading, this.canvas.width / 2, this.canvas.height / (footer ? 4 : 2));

			if (footer) {
				const first_player = this.first_player.status == "win" || this.second_player.status == 'gave_up';
				const second_player = this.second_player.status == "win" || this.first_player.status == 'gave_up';

				context.fillText(first_player ? 'WON' : 'LOST', this.canvas.width / 4, (this.canvas.height / 4) * 3);
				context.fillText(second_player ? 'WON' : 'LOST', (this.canvas.width / 4) * 3, (this.canvas.height / 4) * 3);
			}
		}
	}

	playerMove(key: 'first_player' | 'second_player', event: MouseEvent) {
		if (!this.state || !this.canvas || !this.first_player || !this.second_player) return;

		const canvasLocation = this.canvas.getBoundingClientRect();
		const mouseLocation = event.clientY - canvasLocation.y;

		let y = mouseLocation - Game.PLAYER_HEIGHT / 2;
		if (mouseLocation < Game.PLAYER_HEIGHT / 2)
			y = 0;
		else if (mouseLocation > this.canvas.height - Game.PLAYER_HEIGHT / 2)
			y = this.canvas.height - Game.PLAYER_HEIGHT;

		socket.emit('player_move', { game_id: this.gameID, y });

		if (key == 'first_player')
			this.first_player = { y };
		if (key == 'second_player')
			this.second_player = { y };
	}

	changeDirection(playerPosition: number) {
		if (!this.state || !this.ball) return;

		const impact = this.ball.y - playerPosition - Game.PLAYER_HEIGHT / 2;
		const ratio = 100 / (Game.PLAYER_HEIGHT / 2);

		this.ball.speed.y = Math.round(impact * ratio / 10);
	}

	collide(key: 'first_player' | 'second_player', player: Player) {
		if (!this.state || !this.first_player || !this.second_player || !this.ball) return;

		// The player does not hit the ball
		if (this.state.ball.y < player.y || this.state.ball.y > player.y + Game.PLAYER_HEIGHT)
		{
			this.reset();

			// Update score
			if (key == 'first_player') {
				this.second_player.score++;
			} else {
				this.first_player.score++;
			}

			socket.emit('game_score', { game_id: this.gameID, score: { first_player: this.first_player.score, second_player: this.second_player.score } });
		} 
		else 
		{
			// Change direction
			this.ball.speed.x *= -1;
			this.changeDirection(player.y);

			// Increase speed if it has not reached max speed
			if (Math.abs(this.ball.speed.x) < Game.MAX_SPEED)
				this.ball.speed.x *= 1.2;
		}
	}

	ballMove() {
		if (!this.state || !this.canvas || !this.user || !this.ball || !this.second_player || !this.first_player || !this.is_engine) return;

		if (this.ball.y >= this.canvas.height || this.ball.y <= 0) this.ball.speed.y *= -1;

		if (this.ball.x >= this.canvas.width - (Game.PLAYER_WIDTH + Game.PLAYER_MARGIN)) {
			this.collide("second_player", this.second_player);
		} else if (this.ball.x <= Game.PLAYER_WIDTH + Game.PLAYER_MARGIN) {
			this.collide("first_player", this.first_player);
		}

		this.ball.x = Math.min(Math.max(this.ball.x + this.ball.speed.x, 0), this.canvas.width - (Game.PLAYER_WIDTH + Game.PLAYER_MARGIN));
		this.ball.y = Math.min(Math.max(this.ball.y + this.ball.speed.y, 0), this.canvas.height);

		socket.emit('ball_move', {
			game_id: this.gameID,
			ball: this.ball
		});
	}

	play(init: Boolean = false) {
		if (!this.canvas) return;

		this.draw();
		this.ballMove();

		this.animation = requestAnimationFrame(() => { this.play(); });
		
		if (init) {
			this.canvas.addEventListener('mousemove', this.onMouseMove);
		}
	}

	onMouseMove(event: MouseEvent) {
		if (!this.user || !this.first_player || !this.second_player || !this.is_player) return;

		if (this.user.id == this.first_player.id)
			return this.playerMove('first_player', event);

		if (this.user.id == this.second_player.id)
			return this.playerMove('second_player', event);
	}

	reset(players: Boolean = false) {
		if (!this.state || !this.canvas || !this.ball || !this.first_player || !this.second_player) return;

		// Set ball and players to the center
		this.ball = {
			x: this.canvas.width / 2,
			y: this.canvas.height / 2,
			speed: {
				x: 3,
				y: Math.random() * 3
			}
		};

		if (players) {
			this.first_player = { y: this.canvas.height / 2 - Game.PLAYER_HEIGHT / 2 };
			this.second_player = { y: this.canvas.height / 2 - Game.PLAYER_HEIGHT / 2 };
		}

		if (this.is_engine) {
			socket.emit('game_reset', { game_id: this.gameID, ball: this.ball, players: { first_player: this.first_player.y, second_player: this.second_player.y } });
		}
	}

	joinGame() {
		if (!this.connected || !this.gameID) return;

		socket.emit('join_game', { game_id: this.gameID });
	}

	leaveGame(end: boolean = false) {
		this.stop();

		socket.emit('leave_game', { game_id: this.gameID, quite: true, end });
	}

	stop() {
		if (this.animation) {
			cancelAnimationFrame(this.animation);
			this.animation = undefined;
		}

		if (this.canvas) {
			this.canvas.removeEventListener('mousemove', this.onMouseMove);
		}
	}

	reconnect({ connected }: { connected: Boolean; }) {
		this.connected = connected;

		if (connected) {
			this.joinGame();
		} else {
			this.stop();
			this.leaveGame(true);
			this.loading = 'Loading...';
		}
		this.draw();
	}

	onPlayerMove(key: 'first_player' | 'second_player', player: number) {
		if (typeof player != 'number') return;

		if (key == 'first_player') this.first_player = { y: player };
		if (key == 'second_player') this.second_player = { y: player };

		this.draw();
	}

	init(options: { id: string | number, user: UserData, canvas: HTMLCanvasElement }) {
		this.gameID = (typeof options.id !== 'number' ? Number(options.id) : options.id);
		this.canvas = options.canvas;
		this.user = options.user;

		socket.on('game_joined', (data: { start?: string; finish?: string; is_reset_required?: Boolean; is_engine?: Boolean; is_player?: Boolean; map?: GameMap; first_player: Player; second_player: Player }) => {
			if (data.first_player) this.first_player = data.first_player;
			if (data.second_player) this.second_player = data.second_player;

			this.map = data.map;
			this.is_engine = data.is_engine;
			this.is_player = data.is_player;

			if (data.start) this.loading = undefined;
			else this.loading = 'Loading...';
			if (data.is_reset_required) this.reset(true);

			this.draw();
		});

		socket.on('first_player_move', (data: number) => {
			this.first_player = { y: data };
		});

		socket.on('second_player_move', (data: number) => {
			this.second_player = { y: data };
		});

		socket.on('first_player_score', (data: number) => {
			this.first_player = { score: data };
		});

		socket.on('second_player_score', (data: number) => {
			this.second_player = { score: data };
		});

		socket.on('game_reset', (data: { first_player: number; second_player: number; ball: Ball }) => {
			this.ball = data.ball;
			this.first_player = { y: data.first_player };
			this.second_player = { y: data.second_player };

			this.draw();
		});

		socket.on('game_live', (data: { status: GameLoading }) => {
			this.loading = data.status;
			this.draw();

			if (data.status !== 'GO!') return this.stop();

			setTimeout(() => {
				this.loading = undefined;
				this.play(true);
			}, 1000);
		});

		socket.on('game_over', (data: { first_player: PlayerStatus; second_player: PlayerStatus; }) => {
			this.reset(true);
			this.stop();

			this.loading = 'Game over';
			this.first_player = { status: data.first_player };
			this.second_player = { status: data.second_player };
			this.draw();
		})

		socket.on('ball_move', (data: Ball) => {
			this.ball = data;
			this.draw();
		});

		socket.reconnecting(({ connected }) => {
			this.reconnect({ connected });
		});
	}
}