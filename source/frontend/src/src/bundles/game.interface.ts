export type GameLoading = 'Game over' | 'Loading...' | '3' | '2' | '1' | 'GO!';

export type PlayerStatus = 'win' | 'loose' | 'none' | 'gave_up';

export type GameMap = 'black' | 'red' | 'green' | 'blue';

export interface Position {
	x: number;
	y: number;
};

export interface Ball {
	r: number;
	x: number;
	y: number;
	speed: Position;
}

export interface Player {
	id: number;
	username: string;
	display_name: string;
	avatar: string;
	score: number;
	status?: PlayerStatus;
	y: number;
}

export interface GameState {
	first_player?: Player;
	second_player?: Player;
	is_engine: Boolean;
	is_player: Boolean;
	map: GameMap;
	speed: {
		ratio: number;
	};
	loading?: GameLoading;
	ball: Ball;
	connected: Boolean;
	animation?: number;
}