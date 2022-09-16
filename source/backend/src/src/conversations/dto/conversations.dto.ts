import { IsNumber, IsOptional, Min } from "class-validator";

export class ConversationsDto {
  @IsOptional()
  @IsNumber(
    {},
    {
      message: "Conversation ID must be a number.",
    }
  )
  @Min(0, {
    message: "Conversation ID must be positive.",
  })
  last?: number;
}
