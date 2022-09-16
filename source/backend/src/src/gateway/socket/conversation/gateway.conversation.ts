import { Socket } from "socket.io";

import { ForbiddenException, Injectable } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from "@nestjs/websockets";

import { ConversationRole } from "@/entities/conversation_members.utils";
import { UserEntity } from "@/entities/user.entity";

import * as hashPassword from "@/common/hash/hash.password";

import { AuthenticationService } from "@/authentication/authentication.service";
import { ConversationsService } from "@/conversations/conversations.service";
import { MessageService } from "@/message/message.service";
import { SocketService } from "@/socket/socket.service";
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";

import { JoinConversationDto } from "./dto/join_conversation.dto";
import { LeaveConversationDto } from "./dto/leave_conversation.dto";
import { UpdateConversationDto } from "./dto/update_conversation.dto";

import { GatewayConversationAction } from "./gateway.conversation_action";
import { ConnectionService } from "@/connections/connections.service";

@Injectable()
export class GatewayConversation extends GatewayConversationAction {
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

  @SubscribeMessage("join_conversation")
  async joinConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: JoinConversationDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) throw new ForbiddenException();

    const conversation = await this.getConversation(body.conversation_id);

    let role = await this.conversationsService.getRole(conversation, user.id);

    if (!role) {
      if (conversation.visibility == "protected") {
        if (!body.password) {
          return this.server.to(socket.id).emit("conversation_data", {
            name: conversation.name,
            visibility: conversation.visibility,
          });
        }

        if (!hashPassword.verify(conversation.password, body.password)) {
          return this.server.to(socket.id).emit("conversation_data", {
            name: conversation.name,
            visibility: conversation.visibility,
            invalid_password: true,
          });
        }
      }

      const member = await this.conversationsService.setMember(
        conversation,
        user,
        ConversationRole.MEMBER
      );
      if (member) {
        role = member.role;
      }
    }

    const roles = [
      ConversationRole.OWNER,
      ConversationRole.ADMIN,
      ConversationRole.MEMBER,
      ConversationRole.MUTED,
    ];
    if (!roles.includes(role)) {
      return this.server.to(socket.id).emit("conversation_data", {
        name: conversation.name,
        visibility: conversation.visibility,
        is_banned: true,
      });
    }

    await this.joinRoom(socket, `conversation_${conversation.id}`);

    await this.emitConversationData(conversation);
  }

  @SubscribeMessage("leave_conversation")
  async leaveConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: LeaveConversationDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [
        ConversationRole.OWNER,
        ConversationRole.ADMIN,
        ConversationRole.MEMBER,
        ConversationRole.MUTED,
      ]
    );

    if (body.quite) await this.conversationsService.quite(conversation, user);

    await this.leaveRoom(socket, `conversation_${conversation.id}`);

    socket.emit("conversation_left", {});

    await this.emitConversationData(conversation);
  }

  @SubscribeMessage("update_channel")
  async editConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: UpdateConversationDto
  ) {
    const user = socket.data as UserEntity;
    if (!user) throw new ForbiddenException();

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.OWNER, ConversationRole.ADMIN]
    );

    await this.emitConversationData(conversation);
  }
}
