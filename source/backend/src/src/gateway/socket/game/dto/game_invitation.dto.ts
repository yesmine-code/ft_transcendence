import { IsEnum, IsInt, Min } from "class-validator";

enum GameInvitationResponse {
  ACCEPT = "accept",
  REFUSE = "refuse",
}

export class GameInvitationDto {
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id: number;

  @IsEnum(GameInvitationResponse, {
    message: "Response must be accept or refuse.",
  })
  response: GameInvitationResponse;
}
