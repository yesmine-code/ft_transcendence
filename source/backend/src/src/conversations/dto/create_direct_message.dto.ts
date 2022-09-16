import { IsNumber, Min } from "class-validator";

export class CreateDirectMessageDto {
  @IsNumber(
    {},
    {
      message: "Target ID must be a number.",
    }
  )
  @Min(0, {
    message: "Target ID must be positive.",
  })
  target_id: number;
}
