import { IsFloat } from "@/common/decorators/is_float.decorator";
import { Type } from "class-transformer";
import { IsInt, Min, ValidateNested } from "class-validator";
import { BallDto } from "./ball_move.dto";

export class GamePlayers {
  @IsFloat({
    message: "First player score must be a number.",
  })
  first_player: number;

  @IsFloat({
    message: "Second player score must be a number.",
  })
  second_player: number;
}

export class GameResetDto {
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id: number;

  @ValidateNested()
  @Type(() => BallDto, {
    keepDiscriminatorProperty: false,
  })
  ball: BallDto;

  @ValidateNested()
  @Type(() => GamePlayers, {
    keepDiscriminatorProperty: false,
  })
  players: GamePlayers;
}
