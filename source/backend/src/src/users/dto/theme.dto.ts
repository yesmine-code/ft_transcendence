import { IsEnum } from "class-validator";

import { Theme } from "@/entities/user.utils";

export class UsersThemeDto {
  @IsEnum(Theme, {
    message: "Theme must be light, dark or auto.",
  })
  theme: Theme;
}
