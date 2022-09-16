import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class JoinConversationDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsOptional()
  @IsString({
    message: "Password must be a string.",
  })
  password?: string;
}
