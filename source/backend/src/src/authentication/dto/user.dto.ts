import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  displayName: string;

  //@isEmail()
  @IsNotEmpty()
  emailAdress: string;

  @IsNotEmpty()
  password: string;
}
