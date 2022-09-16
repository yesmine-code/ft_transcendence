import { IsString } from "class-validator";

export class AppSearchDto {
  @IsString({
    message: "The query must be a string.",
  })
  query: string;
}
