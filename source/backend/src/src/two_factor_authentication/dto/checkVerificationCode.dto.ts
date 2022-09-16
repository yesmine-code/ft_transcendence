import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CheckVerificationCodeDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Code cannot be empty.",
  })
  code: string;
}
