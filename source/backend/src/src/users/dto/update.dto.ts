import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateDto {
  @IsOptional()
  @IsString({
    message: "Display name must be a string.",
  })
  @MinLength(4, {
    message: "Display name must be longer than or equal to 4 characters.",
  })
  @MaxLength(20, {
    message: "Display name must be shorter than or equal to 20 characters.",
  })
  display_name?: string;
}
