import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class HistoryDto {
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
  user_id?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber(
    {},
    {
      message: "Score ID is not a number.",
    }
  )
  @Min(0, {
    message: "Score ID is not valid.",
  })
  last?: number;
}
