import { IsInt, Min } from "class-validator";

export class InviteUserToConversationDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsInt({
    message: "User ID must be a number.",
  })
  @Min(0, {
    message: "User ID must be positive.",
  })
  user_id: number;
}
