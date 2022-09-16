import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "@/entities/user.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { MessageEntity } from "@/entities/message.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";

import { UsersService } from "@/users/users.service";
import { SocketService } from "@/socket/socket.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { AuthenticationService } from "@/authentication/authentication.service";

import { MessageService } from "./message.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      SocketEntity,
      ConversationEntity,
      ConversationMembersEntity,
      UserEntity,
    ]),
  ],
  providers: [
    MessageService,
    UsersService,
    SocketService,
    JwtService,
    ConversationsService,
    AuthenticationService,
  ],
  exports: [MessageService],
})
export class MessageModule {}
