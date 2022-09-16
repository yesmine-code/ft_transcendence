import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserEntity } from "@/entities/user.entity";
import { ConnectionEntity } from "@/entities/connection.entity";

import { UsersService } from "@/users/users.service";
import { ConnectionService } from "./connections.service";
import { SocketEntity } from "@/entities/socket.entity";
import { SocketService } from "@/socket/socket.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, SocketEntity, ConnectionEntity]),
  ],
  providers: [UsersService, SocketService, ConnectionService],
  exports: [UsersService, ConnectionService],
})
export class ConnectionsModule {}
