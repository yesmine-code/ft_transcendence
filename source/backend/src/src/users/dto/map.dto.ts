import { IsEnum } from "class-validator";

import { GameMap } from "@/entities/user.utils";

export class UsersMapDto {
  @IsEnum(GameMap, {
    message: "Map must be black, blue, green or red.",
  })
  map: GameMap;
}
