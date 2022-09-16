import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class AddMessageDto {
  @IsInt({
    message: "Conversation ID must be a number.",
  })
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsString({
    message: "Message must be a string.",
  })
  message: string;
}
