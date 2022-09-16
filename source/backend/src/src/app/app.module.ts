import * as Joi from "joi";

import { JwtService } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";

import LoggerMiddleware from "@/common/middlewares/user.middleware";

import { UserEntity } from "@/entities/user.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { MessageEntity } from "@/entities/message.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConnectionEntity } from "@/entities/connection.entity";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";

import { UsersModule } from "@/users/users.module";
import { UsersController } from "@/users/users.controller";

import { AuthenticationModule } from "@/authentication/authentication.module";
import { AuthenticationController } from "@/authentication/authentication.controller";

import { TwoFactorAuthenticationModule } from "@/two_factor_authentication/two_factor_authentication.module";
import { TwoFactorAuthenticationController } from "@/two_factor_authentication/two_factor_authentication.controller";

import { ConversationsModule } from "@/conversations/conversations.module";
import { ConversationsController } from "@/conversations/conversations.controller";

import { MessageModule } from "@/message/message.module";
import { MessageController } from "@/message/message.controller";

import { ConnectionsModule } from "@/connections/connections.module";
import { ConnectionsController } from "@/connections/connections.controller";

import { SocketModule } from "@/socket/socket.module";

import { AppService } from "@/app/app.service";
import { AppController } from "@/app/app.controller";

import { GameEntity } from "@/entities/game.entity";
import { GamesModule } from "@/games/games.module";
import { GamesController } from "@/games/games.controller";

import { GatewayModule } from "@/gateway/gateway.module";
import { AchievementEntity } from "@/entities/achievement.entity";
import { AchievementsModule } from "@/achievements/achievements.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        TWILIO_SENDER_PHONE_NUMBER: Joi.string().required(),
        TWILIO_ACCOUNT_SID: Joi.string().required(),
        TWILIO_AUTH_TOKEN: Joi.string().required(),
        TWILIO_VERIFICATION_SERVICE_SID: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        UserEntity,
        ConnectionEntity,
        ConversationEntity,
        AchievementEntity,
        ConversationMembersEntity,
        MessageEntity,
        SocketEntity,
        ConversationEntity,
        GameEntity,
      ],
      keepConnectionAlive: true,
      synchronize: true,
    }),
    UsersModule,
    SocketModule,
    ConversationsModule,
    MessageModule,
    AchievementsModule,
    ConnectionsModule,
    AuthenticationModule,
    TwoFactorAuthenticationModule,
    GamesModule,
    GatewayModule,
  ],
  providers: [AppService, JwtService],
  controllers: [
    UsersController,
    ConversationsController,
    ConnectionsController,
    MessageController,
    AuthenticationController,
    AppController,
    TwoFactorAuthenticationController,
    GamesController,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
