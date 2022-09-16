import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "@/entities/user.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";

import { UsersService } from "@/users/users.service";

import { SocketService } from "@/socket/socket.service";

import { ConversationsService } from "./conversations.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ConversationEntity,
      ConversationMembersEntity,
      SocketEntity,
    ]),
  ],
  providers: [UsersService, ConversationsService, SocketService],
  exports: [UsersService, ConversationsService, SocketService],
})
export class ConversationsModule {}
