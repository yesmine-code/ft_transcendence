import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule, JwtService } from "@nestjs/jwt";

import { UserEntity } from "@/entities/user.entity";
import { ConnectionEntity } from "@/entities/connection.entity";

import { UsersModule } from "@/users/users.module";

import { IntraStrategy } from "./intra/intra.strategy";
import { IntraGuard } from "./intra/intra.guard";

import { AuthenticationService } from "./authentication.service";

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([UserEntity, ConnectionEntity]),
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION },
    }),
  ],
  providers: [AuthenticationService, JwtService, IntraStrategy, IntraGuard],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
