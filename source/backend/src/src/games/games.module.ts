import { Module } from "@nestjs/common";
import { GamesService } from "./games.service";
import { GamesController } from "./games.controller";
import { UserEntity } from "@/entities/user.entity";
import { GameEntity } from "@/entities/game.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "@/users/users.service";
import { SocketService } from "@/socket/socket.service";
import { SocketEntity } from "@/entities/socket.entity";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConnectionEntity } from "@/entities/connection.entity";
import { MessageEntity } from "@/entities/message.entity";
import { ConnectionService } from "@/connections/connections.service";
import { MessageService } from "@/message/message.service";
import { AchievementsService } from "@/achievements/achievements.service";
import { AchievementEntity } from "@/entities/achievement.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameEntity,
      UserEntity,
      ConversationEntity,
      ConversationMembersEntity,
      SocketEntity,
      ConnectionEntity,
      MessageEntity,
      AchievementEntity,
    ]),
  ],
  providers: [
    GamesService,
    ConnectionService,
    UsersService,
    SocketService,
    MessageService,
    AchievementsService,
  ],
  exports: [GamesService, UsersService],
  controllers: [GamesController],
})
export class GamesModule {}
