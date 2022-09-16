import { Socket } from "socket.io";

import { Injectable, NotFoundException } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { AuthenticationService } from "@/authentication/authentication.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { MessageService } from "@/message/message.service";
import { SocketService } from "@/socket/socket.service";
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";

import { JoinProfileDto } from "./dto/join_profile.dto";
import { LeaveProfileDto } from "./dto/leave_profile.dto";

import { GatewayConversationMessage } from "../conversation/gateway.conversation_message";
import { ConnectionService } from "@/connections/connections.service";

@Injectable()
export class GatewayProfile extends GatewayConversationMessage {
  constructor(
    public usersService: UsersService,
    public socketService: SocketService,
    public messageService: MessageService,
    public conversationsService: ConversationsService,
    public connectionService: ConnectionService,
    public authenticationService: AuthenticationService,
    public gamesService: GamesService
  ) {
    super(
      usersService,
      socketService,
      messageService,
      conversationsService,
      connectionService,
      authenticationService,
      gamesService
    );
  }

  @SubscribeMessage("join_profile")
  async joinProfile(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: JoinProfileDto
  ) {
    const profile = await this.usersService.findOneById(body.user_id);
    if (!profile) throw new NotFoundException();

    await this.joinRoom(socket, `profile_${profile.id}`);
  }

  @SubscribeMessage("leave_profile")
  async leaveProfile(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: LeaveProfileDto
  ) {
    const profile = await this.usersService.findOneById(body.user_id);
    if (!profile) throw new NotFoundException();

    await this.leaveRoom(socket, `profile_${profile.id}`);
  }
}
