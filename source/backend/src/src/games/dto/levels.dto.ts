import { IsNumber, IsOptional, Min } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class LevelsDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber(
    {},
    {
      message: "User ID is not a number.",
    }
  )
  @Min(0, {
    message: "User ID is not valid.",
  })
  user_id: number;
}
