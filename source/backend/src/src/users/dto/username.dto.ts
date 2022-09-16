import { IsString, MaxLength, MinLength } from "class-validator";

export class UsernameDto {
  @IsString({
    message: "Username must be a string.",
  })
  @MinLength(4, {
    message: "Username must be longer than or equal to 4 characters.",
  })
  @MaxLength(20, {
    message: "Username must be shorter than or equal to 20 characters.",
  })
  username: string;
}
