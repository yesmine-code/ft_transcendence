import { ConversationVisibility } from "@/entities/conversation.utils";
import {
  IsEnum,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

export class CreateChannelDto {
  @IsString({
    message: "Conversation name must be a string.",
  })
  @MinLength(4, {
    message: "Conversation name must be longer than or equal to 4 characters.",
  })
  @MaxLength(50, {
    message:
      "Conversation name must be shorter than or equal to 50 characters.",
  })
  name: string;

  @IsEnum(ConversationVisibility, {
    message: "Conversation visibility must be public, private or protected.",
  })
  visibility: ConversationVisibility;

  @ValidateIf((o) => o.visibility === ConversationVisibility.PROTECTED)
  @IsString({
    message: "Password must be a string.",
  })
  @MinLength(12, {
    message: "Password must be longer than or equal to 12 characters.",
  })
  @MaxLength(50, {
    message: "Password must be shorter than or equal to 50 characters.",
  })
  @Matches(/(?=.*[a-z]).*$/, {
    message: "Password must contain at least 1 lowercase.",
  })
  @Matches(/(?=.*[A-Z]).*$/, {
    message: "Password must contain at least 1 uppercase.",
  })
  @Matches(/(?=.*\d).*$/, {
    message: "Password must contain at least 1 digit.",
  })
  password?: string;
}
