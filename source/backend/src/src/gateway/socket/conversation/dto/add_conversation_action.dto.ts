import { ConversationAction } from "@/entities/conversation_members.utils";
import { IsEnum, IsInt, Min } from "class-validator";

export class AddConversationActionDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsEnum(ConversationAction, {
    message: "Action must be none, writing or playing.",
  })
  action: ConversationAction;
}
