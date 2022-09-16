import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "@/entities/user.entity";

import { UsersService } from "@/users/users.service";

import { TwoFactorAuthenticationController } from "./two_factor_authentication.controller";
import { TwoFactorAuthenticationService } from "./two_factor_authentication.service";
import { SocketService } from "@/socket/socket.service";
import { SocketEntity } from "@/entities/socket.entity";
import { AuthenticationService } from "@/authentication/authentication.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SocketEntity])],
  controllers: [TwoFactorAuthenticationController],
  providers: [
    TwoFactorAuthenticationService,
    UsersService,
    SocketService,
    AuthenticationService,
    ConfigService,
    JwtService,
  ],
})
export class TwoFactorAuthenticationModule {}
