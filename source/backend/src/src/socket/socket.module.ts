import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { SocketEntity } from "@/entities/socket.entity";
import { GameEntity } from "@/entities/game.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";

import { SocketService } from "./socket.service";
import { UsersService } from "@/users/users.service";
import { UserEntity } from "@/entities/user.entity";
import { ConversationsService } from "@/conversations/conversations.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      GameEntity,
      ConversationEntity,
      ConversationMembersEntity,
      SocketEntity,
    ]),
  ],
  providers: [UsersService, ConversationsService, SocketService],
  exports: [UsersService, ConversationsService, SocketService],
})
export class SocketModule {}
