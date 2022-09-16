import { Socket } from "socket.io";

import { ForbiddenException, Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { UserEntity } from "@/entities/user.entity";
import { ConversationRole } from "@/entities/conversation_members.utils";

import { MessageService } from "@/message/message.service";
import { SocketService } from "@/socket/socket.service";
import { AuthenticationService } from "@/authentication/authentication.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { ConnectionService } from "@/connections/connections.service";
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";

import { AddConversationActionDto } from "./dto/add_conversation_action.dto";

import { GatewaySocket } from "../gateway.socket";

@Injectable()
export class GatewayConversationAction extends GatewaySocket {
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

  @SubscribeMessage("add_conversation_action")
  async setConversationAction(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: AddConversationActionDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) throw new ForbiddenException();

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.OWNER, ConversationRole.ADMIN, ConversationRole.MEMBER]
    );

    await this.conversationsService.setAction(conversation, user, body.action);

    await this.emitConversationData(conversation);
  }
}
