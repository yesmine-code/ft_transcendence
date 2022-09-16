import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "@/entities/user.entity";
import { GameEntity } from "@/entities/game.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { MessageEntity } from "@/entities/message.entity";
import { ConnectionEntity } from "@/entities/connection.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";

import { UsersService } from "@/users/users.service";
import { SocketService } from "@/socket/socket.service";
import { MessageService } from "@/message/message.service";
import { GamesService } from "@/games/games.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { AuthenticationService } from "@/authentication/authentication.service";
import { ConnectionService } from "@/connections/connections.service";

import { GatewayGame } from "./socket/game/gateway.game";
import { AchievementEntity } from "@/entities/achievement.entity";
import { AchievementsService } from "@/achievements/achievements.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageEntity,
      SocketEntity,
      ConnectionEntity,
      ConversationEntity,
      ConversationMembersEntity,
      UserEntity,
      GameEntity,
      AchievementEntity,
    ]),
  ],
  providers: [
    UsersService,
    SocketService,
    MessageService,
    AchievementsService,
    GamesService,
    ConnectionService,
    ConversationsService,
    AuthenticationService,
    JwtService,
    GatewayGame,
  ],
})
export class GatewayModule {}
