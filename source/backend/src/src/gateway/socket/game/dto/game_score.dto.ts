import { Type } from "class-transformer";
import { IsInt, Min, ValidateNested } from "class-validator";

export class GameScore {
  @IsInt({
    message: "First player score must be a number.",
  })
  first_player: number;

  @IsInt({
    message: "Second player score must be a number.",
  })
  second_player: number;
}

export class GameScoreDto {
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id: number;

  @ValidateNested()
  @Type(() => GameScore, {
    keepDiscriminatorProperty: false,
  })
  score: GameScore;
}
