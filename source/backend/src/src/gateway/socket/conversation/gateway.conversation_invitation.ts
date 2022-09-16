import { Socket } from "socket.io";

import { Injectable } from "@nestjs/common";
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
import { UsersService } from "@/users/users.service";
import { GamesService } from "@/games/games.service";
import { ConnectionService } from "@/connections/connections.service";

import { InvitableUsersConversationDto } from "./dto/invitable_users_conversation.dto";
import { InviteUserToConversationDto } from "./dto/invite_user_to_conversation.dto";
import { AcceptInvitationToConversationDto } from "./dto/accept_invitation_to_conversation.dto";
import { DeclineInvitationToConversationDto } from "./dto/decline_invitation_to_conversation.dto";

import { GatewayConversation } from "./gateway.conversation";

@Injectable()
export class GatewayConversationInvitation extends GatewayConversation {
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

  @SubscribeMessage("invitable_users_channel")
  async invitableUsersConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: InvitableUsersConversationDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.OWNER, ConversationRole.ADMIN]
    );

    await this.emitSearch(body.query, conversation);
  }

  @SubscribeMessage("invite_user_to_channel")
  async inviteUserToConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: InviteUserToConversationDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.OWNER, ConversationRole.ADMIN]
    );

    await this.emitConversationInvitation(body.user_id, conversation);
  }

  @SubscribeMessage("decline_invitation_to_channel")
  async declineInvitationToConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: DeclineInvitationToConversationDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.PENDING]
    );

    await this.conversationsService.deleteMember(conversation, user);

    await this.emitConversationData(conversation);
  }

  @SubscribeMessage("accept_invitation_to_channel")
  async acceptInvitationToConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: AcceptInvitationToConversationDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.PENDING]
    );

    await this.conversationsService.setMemberRole(
      conversation,
      user,
      ConversationRole.MEMBER
    );

    await this.emitConversationData(conversation);
  }
}
