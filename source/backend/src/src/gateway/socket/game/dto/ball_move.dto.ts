import { IsFloat } from "@/common/decorators/is_float.decorator";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min, ValidateNested } from "class-validator";

export class BallSpeedDto {
  @IsFloat({
    message: "Y speed is not a number.",
  })
  y: number;

  @IsFloat({
    message: "X speed is not a number.",
  })
  x: number;
}

export class BallDto {
  @IsFloat({
    message: "Y position is not a number.",
  })
  y: number;

  @IsFloat({
    message: "X position is not a number.",
  })
  x: number;

  @ValidateNested()
  @Type(() => BallSpeedDto, {
    keepDiscriminatorProperty: false,
  })
  speed: BallSpeedDto;
}

export class BallMoveDto {
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id: number;

  @ValidateNested()
  @Type(() => BallDto, {
    keepDiscriminatorProperty: false,
  })
  ball: BallDto;
}
