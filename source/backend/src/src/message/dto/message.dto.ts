import { IsNumber, IsOptional, Min } from "class-validator";

export class MessageDto {
  @IsNumber(
    {},
    {
      message: "Conversation ID must be a number.",
    }
  )
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  conversation_id: number;

  @IsOptional()
  @IsNumber(
    {},
    {
      message: "Message ID must be a number.",
    }
  )
  @Min(0, {
    message: "Message ID must be positive.",
  })
  last?: number;
}
