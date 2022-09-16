import { Socket } from "socket.io";

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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

import { PromoteToAdminDto } from "./dto/promote_to_admin.dto";

import { GatewayConversationInvitation } from "./gateway.conversation_invitation";
import { GamesService } from "@/games/games.service";
import { ConnectionService } from "@/connections/connections.service";

@Injectable()
export class GatewayConversationMember extends GatewayConversationInvitation {
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

  @SubscribeMessage("conversation_member_admin")
  async channelMemberAdmin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: PromoteToAdminDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.getConversation(
      body.conversation_id,
      user.id,
      [ConversationRole.OWNER, ConversationRole.ADMIN]
    );

    const role = await this.conversationsService.getRole(
      conversation,
      body.user_id
    );
    if (
      !role ||
      ![ConversationRole.ADMIN, ConversationRole.MEMBER].includes(role)
    )
      throw new ForbiddenException();

    const member = await this.usersService.findOneById(body.user_id);

    await this.conversationsService.setMemberRole(
      conversation,
      member,
      role == ConversationRole.ADMIN
        ? ConversationRole.MEMBER
        : ConversationRole.ADMIN
    );

    await this.emitConversationData(conversation);
  }

  @SubscribeMessage("conversation_member_mute")
  async channelMemberMute(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: PromoteToAdminDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.conversationsService.findConversationById(
      body.conversation_id
    );
    if (!conversation) throw new NotFoundException();

    const user_role = await this.conversationsService.getRole(
      conversation,
      user.id
    );
    const allowed_user_role = [ConversationRole.OWNER, ConversationRole.ADMIN];
    if (!user_role || !allowed_user_role.includes(user_role))
      throw new ForbiddenException();

    const allowed_member_roles = [
      ConversationRole.MEMBER,
      ConversationRole.MUTED,
      ConversationRole.BANNED,
    ];
    if (user_role == ConversationRole.OWNER)
      allowed_member_roles.push(ConversationRole.ADMIN);

    const member_role = await this.conversationsService.getRole(
      conversation,
      body.user_id
    );
    if (!member_role || !allowed_member_roles.includes(member_role))
      throw new ForbiddenException();

    const member = await this.usersService.findOneById(body.user_id);
    if (!member) throw new ForbiddenException();
    await this.conversationsService.setMemberRole(
      conversation,
      member,
      member_role == ConversationRole.MUTED
        ? ConversationRole.MEMBER
        : ConversationRole.MUTED
    );

    await this.emitConversationData(conversation);
  }

  @SubscribeMessage("conversation_member_ban")
  async channelMemberBan(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: PromoteToAdminDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.conversationsService.findConversationById(
      body.conversation_id
    );
    if (!conversation) throw new NotFoundException();

    const user_role = await this.conversationsService.getRole(
      conversation,
      user.id
    );
    const allowed_user_role = [ConversationRole.OWNER, ConversationRole.ADMIN];
    if (!user_role || !allowed_user_role.includes(user_role))
      throw new ForbiddenException();

    const allowed_member_roles = [
      ConversationRole.MEMBER,
      ConversationRole.MUTED,
      ConversationRole.BANNED,
    ];
    if (user_role == ConversationRole.OWNER)
      allowed_member_roles.push(ConversationRole.ADMIN);

    const member_role = await this.conversationsService.getRole(
      conversation,
      body.user_id
    );
    if (!member_role || !allowed_member_roles.includes(member_role))
      throw new ForbiddenException();

    const member = await this.usersService.findOneById(body.user_id);
    if (!member) throw new ForbiddenException();
    await this.conversationsService.setMemberRole(
      conversation,
      member,
      member_role == ConversationRole.BANNED
        ? ConversationRole.MEMBER
        : ConversationRole.BANNED
    );

    await this.emitConversationData(conversation);
  }

  @SubscribeMessage("conversation_member_kick")
  async channelMemberKick(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: PromoteToAdminDto
  ) {
    const user = socket.data as UserEntity;

    const conversation = await this.conversationsService.findConversationById(
      body.conversation_id
    );
    if (!conversation) throw new NotFoundException();

    const user_role = await this.conversationsService.getRole(
      conversation,
      user.id
    );
    const allowed_user_role = [ConversationRole.OWNER, ConversationRole.ADMIN];
    if (!user_role || !allowed_user_role.includes(user_role))
      throw new ForbiddenException();

    const allowed_member_roles = [
      ConversationRole.MEMBER,
      ConversationRole.MUTED,
      ConversationRole.BANNED,
    ];
    if (user_role == ConversationRole.OWNER)
      allowed_member_roles.push(ConversationRole.ADMIN);

    const member_role = await this.conversationsService.getRole(
      conversation,
      body.user_id
    );
    if (!member_role || !allowed_member_roles.includes(member_role))
      throw new ForbiddenException();

    const member = await this.usersService.findOneById(body.user_id);
    if (!member) throw new ForbiddenException();

    await this.conversationsService.quite(conversation, member);

    await this.emitConversationData(conversation);
  }
}
