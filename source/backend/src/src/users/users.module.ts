import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

import { UserEntity } from "@/entities/user.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConnectionEntity } from "@/entities/connection.entity";

import { UsersService } from "./users.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { ConnectionService } from "@/connections/connections.service";
import { TwoFactorAuthenticationService } from "@/two_factor_authentication/two_factor_authentication.service";
import { MessageEntity } from "@/entities/message.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { SocketService } from "@/socket/socket.service";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      ConversationEntity,
      ConversationMembersEntity,
      SocketEntity,
      ConnectionEntity,
      MessageEntity,
    ]),
  ],
  providers: [
    SocketService,
    UsersService,
    ConversationsService,
    ConnectionService,
    TwoFactorAuthenticationService,
    ConfigService,
  ],
  exports: [
    UsersService,
    SocketService,
    ConversationsService,
    ConnectionService,
    TwoFactorAuthenticationService,
  ],
})
export class UsersModule {}
