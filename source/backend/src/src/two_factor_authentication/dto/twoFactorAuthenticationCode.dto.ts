import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TwoFactorAuthenticationCodeDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Code cannot be empty.",
  })
  twoFactorAuthenticationCode: string;
}
