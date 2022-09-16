import { IsInt, Min } from "class-validator";

export class UpdateConversationDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;
}
