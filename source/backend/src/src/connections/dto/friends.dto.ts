import { IsNumber, IsOptional, Min } from "class-validator";

export class FriendsDto {
  @IsOptional()
  @IsNumber(
    {},
    {
      message: "Connection ID must be a number.",
    }
  )
  @Min(0, {
    message: "Connection ID must be positive.",
  })
  last?: number;
}
