import { Socket } from "socket.io";

import { Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { UserEntity } from "@/entities/user.entity";
import { ConversationRole } from "@/entities/conversation_members.utils";

import { AuthenticationService } from "@/authentication/authentication.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { MessageService } from "@/message/message.service";
import { SocketService } from "@/socket/socket.service";
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";

import { AddMessageDto } from "./dto/add_message.dto";

import { GatewayConversationMember } from "./gateway.conversation_member";
import { ConnectionService } from "@/connections/connections.service";

@Injectable()
export class GatewayConversationMessage extends GatewayConversationMember {
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

  @SubscribeMessage("add_message")
  async getMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: AddMessageDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.OWNER, ConversationRole.ADMIN, ConversationRole.MEMBER]
    );

    await this.emitConversationMessage(conversation, user, body.message);
  }
}
