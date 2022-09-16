import { Module } from "@nestjs/common";
import { UserEntity } from "@/entities/user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ConversationMembersEntity } from "@/entities/conversation_members.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConnectionEntity } from "@/entities/connection.entity";
import { AchievementEntity } from "@/entities/achievement.entity";
import { MessageEntity } from "@/entities/message.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { GameEntity } from "@/entities/game.entity";

import { UsersService } from "@/users/users.service";
import { SocketService } from "@/socket/socket.service";
import { AchievementsService } from "@/achievements/achievements.service";

import { AchievementsController } from "./achievements.controller";

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
  providers: [AchievementsService, UsersService, SocketService],
  exports: [AchievementsService, UsersService],
  controllers: [AchievementsController],
})
export class AchievementsModule {}
