import { ProfileInterface } from "../index.interface";

export interface AchievementsProps {
	profile: ProfileInterface;
}

export enum AchievementEnum {
	WIN_10_TIMES = "win_10_times",
	WIN_25_TIMES = "win_25_times",
	WIN_50_TIMES = "win_50_times",
	EXPERT = "expert",

	PLAY_10_TIMES = "play_10_times",
	PLAY_25_TIMES = "play_25_times",
	PLAY_50_TIMES = "play_50_times",
}


export interface AchievementsState {
	achievements: AchievementEnum[];
}