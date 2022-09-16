import { IsString } from "class-validator";

export class ProfileDto {
  @IsString({
    message: "Username must be a string.",
  })
  username: string;
}
