import { IsInt, IsString, Min } from "class-validator";

export class InvitableUsersConversationDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsString({
    message: "Query must be a string.",
  })
  query: string;
}
