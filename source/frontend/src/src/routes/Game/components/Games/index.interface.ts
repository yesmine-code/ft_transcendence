export enum GameStatus {
	WIN = "win",
	LOOSE = "loose",
	GAVE_UP = "gave_up",
}

export interface GameResult {
	status: 'Victory' | 'Defeat';
	message?: string;
}

export interface GamePlayer {
	id: number;
	username: string;
	display_name: string;
	avatar: string;
	score: number;
	status: GameStatus;
}

export interface Game {
	first_player: GamePlayer;
	second_player: GamePlayer;
	finish: string;
	id: number;
}

export interface GameState {
	games?: Game[];
}