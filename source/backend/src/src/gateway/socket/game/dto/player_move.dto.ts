import { IsInt, Min } from "class-validator";
import { IsFloat } from "@/common/decorators/is_float.decorator";

export class PlayerMoveDto {
  @IsInt({
    message: "Game ID must be a number.",
  })
  @Min(0, {
    message: "Game ID must be positive.",
  })
  game_id: number;

  @IsFloat({
    message: "Game ID must be a number.",
  })
  y: number;
}
