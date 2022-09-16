import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class PhoneNumberDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Phone number cannot be empty.",
  })
  @IsPhoneNumber("FR", {
    message: "Phone number is not valid.",
  })
  phone_number: string;
}
