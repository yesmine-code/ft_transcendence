import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateDto {
  @ApiProperty()
  @IsBoolean({
    message: "Enabled must be a boolean.",
  })
  enable: boolean;
}
