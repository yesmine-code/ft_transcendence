import { IsNotEmpty, IsNumber, Min } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

import { NotMatch } from "@/common/decorators/not_match.decorator";

export class SaveDto {
  @ApiProperty()
  @IsNumber(
    {},
    {
      message: "First player ID is not a number.",
    }
  )
  @Min(0, {
    message: "First player ID is not valid.",
  })
  first_player: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber(
    {},
    {
      message: "First player score is not a number.",
    }
  )
  @Min(0, {
    message: "First player score is not valid.",
  })
  first_player_score: number;

  @ApiProperty()
  @IsNumber(
    {},
    {
      message: "Second player ID is not a number.",
    }
  )
  @Min(0, {
    message: "Second player ID is not valid.",
  })
  @NotMatch("first_player", {
    message: "Player cannot play against himself.",
  })
  second_player: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber(
    {},
    {
      message: "Second player score is not a number.",
    }
  )
  @Min(0, {
    message: "Second player score is not valid.",
  })
  second_player_score: number;
}
