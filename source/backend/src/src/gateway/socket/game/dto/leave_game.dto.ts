import { IsBoolean, IsInt, IsOptional, Min } from "class-validator";

export class LeaveGameDto {
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id: number;

  @IsOptional()
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id?: number;

  @IsBoolean({
    message: "Quite is not valid.",
  })
  quite: boolean;

  @IsBoolean({
    message: "End is not valid.",
  })
  end: boolean;
}
