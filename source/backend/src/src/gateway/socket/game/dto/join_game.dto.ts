import { IsInt, IsOptional, Min } from "class-validator";

export class JoinGameDto {
  @IsOptional()
  @IsInt({
    message: "Opponent ID must be a number.",
  })
  @Min(0, {
    message: "Opponent ID must be positive.",
  })
  opponent_id?: number;

  @IsOptional()
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id?: number;

  @IsOptional()
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id?: number;
}
