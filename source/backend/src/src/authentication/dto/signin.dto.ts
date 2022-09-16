import { IsString } from "class-validator";

export class SignInDto {
  @IsString({
    message: "Email is not valid.",
  })
  email: string;

  @IsString({
    message: "Password must be a string.",
  })
  password: string;
}
