import { IsBoolean, IsInt, Min } from "class-validator";

export class LeaveConversationDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsBoolean({
    message: "Quite is not valid.",
  })
  quite: boolean;
}
