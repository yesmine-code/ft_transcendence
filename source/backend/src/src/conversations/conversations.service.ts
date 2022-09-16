import { FindOneOptions, Repository } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { ForbiddenException, Injectable } from "@nestjs/common";

import { UserEntity } from "@/entities/user.entity";
import { ConversationEntity } from "@/entities/conversation.entity";
import { ConversationVisibility } from "@/entities/conversation.utils";
import { ConversationMembersEntity } from "@/entities/conversation_members.entity";
import {
  ConversationAction,
  ConversationRole,
} from "@/entities/conversation_members.utils";

import * as hashPassword from "@/common/hash/hash.password";
import { UsersService } from "@/users/users.service";
import { SocketService } from "@/socket/socket.service";

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(ConversationEntity)
    private conversationsRepository: Repository<ConversationEntity>,

    @InjectRepository(ConversationMembersEntity)
    private conversationMembersRepository: Repository<ConversationMembersEntity>,

    private usersService: UsersService,
    private socketService: SocketService
  ) {}

  async setChannel(
    name: string,
    visibility: ConversationVisibility,
    password?: string
  ): Promise<ConversationEntity> {
    if (password) {
      password = hashPassword.encode(password);
    }

    const conversation = this.conversationsRepository.create({
      name,
      visibility,
      password,
    });
    return await this.conversationsRepository.save(conversation);
  }

  async getDirectMessage(
    source: UserEntity | number,
    target: UserEntity | number
  ) {
    return await this.conversationMembersRepository
      .createQueryBuilder("conversation_members")
      .leftJoinAndSelect("conversation_members.user", "user")
      .leftJoinAndSelect("conversation_members.conversation", "conversation")
      .where("conversation.visibility = :visibility", {
        visibility: ConversationVisibility.DIRECT_MESSAGE,
      })
      .andWhere("user.id = :source", {
        source: typeof source == "number" ? source : source.id,
      })
      .andWhere("conversation_members.role = :role", {
        role: ConversationRole.OWNER,
      })
      .andWhere(
        'conversation.id IN (SELECT "conversationId" FROM conversation_members WHERE "userId" = :target AND "role" = :role)',
        {
          target: typeof target == "number" ? target : target.id,
          role: ConversationRole.OWNER,
        }
      )
      .select([
        'conversation.id as "id"',
        'conversation.name as "name"',
        'conversation.visibility as "visibility"',
      ])
      .getRawOne();
  }

  async setDirectMessage(
    source: UserEntity | number,
    target: UserEntity | number
  ) {
    const dm = await this.getDirectMessage(source, target);
    if (dm) return dm;

    const conversation = await this.conversationsRepository.save(
      this.conversationsRepository.create({
        visibility: ConversationVisibility.DIRECT_MESSAGE,
      })
    );

    await this.setMember(conversation, source, ConversationRole.OWNER);
    await this.setMember(conversation, target, ConversationRole.OWNER);

    return conversation;
  }

  async setMember(
    conversation: ConversationEntity | number,
    user: UserEntity | number,
    role: ConversationRole = ConversationRole.MEMBER
  ): Promise<ConversationMembersEntity> {
    if (typeof conversation == "number")
      conversation = await this.findConversationById(conversation);

    if (typeof user == "number")
      user = await this.usersService.findOneById(user);

    return await this.conversationMembersRepository.save(
      this.conversationMembersRepository.create({
        user,
        conversation,
        role,
      })
    );
  }

  async setMemberRole(
    conversation: ConversationEntity,
    user: UserEntity,
    role: ConversationRole = ConversationRole.MEMBER
  ) {
    const member = await this.conversationMembersRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
        conversation: {
          id: conversation.id,
        },
      },
    });
    if (!member) throw new ForbiddenException();

    member.role = role;
    member.joined = new Date();

    return await this.conversationMembersRepository.save(member);
  }

  async findConversationById(
    id: number,
    options?: FindOneOptions<ConversationEntity>
  ): Promise<ConversationEntity> {
    return await this.conversationsRepository.findOne({
      where: [
        {
          id,
        },
      ],
      ...(options || {}),
    });
  }

  async getConversationMember(
    conversation: ConversationEntity | number,
    user: UserEntity | number
  ) {
    return await this.conversationMembersRepository
      .createQueryBuilder("conversation_members")
      .leftJoinAndSelect("conversation_members.user", "user")
      .leftJoinAndSelect("conversation_members.conversation", "conversation")
      .where("conversation.id = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .andWhere("user.id = :userId", {
        userId: typeof user == "number" ? user : user.id,
      })
      .select([
        'conversation_members.role as "role"',
        'conversation_members.action as "action"',
      ])
      .getRawOne();
  }

  async getMembers(conversation: ConversationEntity | number) {
    const members = await this.conversationMembersRepository
      .createQueryBuilder("conversation_members")
      .leftJoinAndSelect("conversation_members.user", "user")
      .leftJoinAndSelect("conversation_members.conversation", "conversation")
      .where("conversation_members.conversation = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .select([
        'user.id as "id"',
        'user.username as "username"',
        'user.display_name as "display_name"',
        'user.status as "status"',
        "concat('/users/avatar/', user.id, '/', user.avatar) as \"avatar\"",
        'conversation_members.role as "role"',
        'conversation_members.action as "action"',
      ])
      .addOrderBy("joined", "ASC")
      .getRawMany();

    return [].concat(members);
  }

  async findLike(query: string): Promise<ConversationEntity[]> {
    return await this.conversationsRepository
      .createQueryBuilder("conversations")
      .take(10)
      .where("conversations.name like :name", { name: `${query}%` })
      .select([
        'conversations.id as "id"',
        "concat('/channels/', conversations.id) as \"url\"",
        "concat('#', conversations.name) as \"value\"",
      ])
      .getRawMany();
  }

  async searchInvitableUsers(conversation: ConversationEntity, query: string) {
    return await this.usersRepository
      .createQueryBuilder("user")
      .leftJoinAndMapOne(
        "user.id",
        ConversationMembersEntity,
        "conversation_members",
        "conversation_members.user.id = user.id AND conversation_members.conversation.id = :conversationId",
        { conversationId: conversation.id }
      )
      .where("user.username like :name", { name: `${query}%` })
      .andWhere("conversation_members.conversation.id IS NULL")
      .select([
        'user.id as "id"',
        'user.username as "username"',
        'user.display_name as "display_name"',
        "concat('/users/avatar/', user.id, '/', user.avatar) as \"avatar\"",
      ])
      .take(10)
      .getRawMany();
  }

  async inviteUser(conversation: ConversationEntity, user: UserEntity) {
    await this.setMember(conversation, user, ConversationRole.PENDING);
  }

  async getChannels(
    user: UserEntity | number,
    roles: ConversationRole[],
    last?: number
  ): Promise<ConversationEntity[]> {
    const query = this.conversationMembersRepository
      .createQueryBuilder("conversation_members")
      .leftJoinAndSelect("conversation_members.conversation", "conversation")
      .leftJoinAndSelect("conversation_members.user", "user")
      .where("user.id = :userId", {
        userId: typeof user == "number" ? user : user.id,
      })
      .andWhere("conversation.visibility != :visibility", {
        visibility: ConversationVisibility.DIRECT_MESSAGE,
      })
      .andWhere("role IN (:...roles)", { roles })
      .select([
        'conversation.id as "id"',
        'conversation.name as "name"',
        'conversation.created as "created"',
        'conversation.visibility as "visibility"',
      ])
      .addOrderBy("conversation_members.joined", "DESC")
      .limit(20);

    if (last && last > 0)
      query.andWhere("conversation_members.id < :last", { last });

    return await query.getRawMany();
  }

  async getDirectMessages(
    user: UserEntity | number,
    last?: number
  ): Promise<ConversationEntity[]> {
    const query = this.conversationMembersRepository
      .createQueryBuilder("conversation_members")
      .leftJoinAndSelect("conversation_members.conversation", "conversation")
      .leftJoinAndMapOne(
        "conversation_members.channel",
        ConversationMembersEntity,
        "target_member",
        "target_member.conversation.id = conversation_members.conversation.id AND target_member.user.id != :userId",
        {
          userId: typeof user == "number" ? user : user.id,
        }
      )
      .leftJoinAndSelect("conversation_members.user", "source")
      .leftJoinAndSelect("target_member.user", "target")
      .where("source.id = :sourceId", {
        sourceId: typeof user == "number" ? user : user.id,
      })
      .andWhere("conversation.visibility = :visibility", {
        visibility: ConversationVisibility.DIRECT_MESSAGE,
      })
      .select([
        'conversation.id as "id"',
        'target.username as "name"',
        'conversation.created as "created"',
        'conversation.visibility as "visibility"',
      ])
      .addOrderBy("conversation_members.joined", "DESC")
      .limit(20);

    if (last && last > 0)
      query.andWhere(
        'conversation_members.joined < (SELECT joined FROM conversation_members WHERE "conversationId" = :last LIMIT 1)',
        { last }
      );

    return await query.getRawMany();
  }

  async editConversation(
    conversation: ConversationEntity | number,
    data: {
      name: string;
      visibility: ConversationVisibility;
      password?: string;
    }
  ) {
    return await this.conversationsRepository
      .createQueryBuilder("conversations")
      .update(ConversationEntity)
      .set(data)
      .where("id = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .execute();
  }

  async deleteConversation(conversation: ConversationEntity | number) {
    return await this.conversationsRepository
      .createQueryBuilder("conversations")
      .delete()
      .from(ConversationEntity)
      .where("id = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .execute();
  }

  async deleteMember(
    conversation: ConversationEntity | number,
    user: UserEntity | number
  ) {
    return await this.conversationMembersRepository
      .createQueryBuilder()
      .delete()
      .from(ConversationMembersEntity)
      .where("conversation.id = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .andWhere("user.id = :userId", {
        userId: typeof user == "number" ? user : user.id,
      })
      .execute();
  }

  async getRole(
    conversation: ConversationEntity | number,
    user: UserEntity | number
  ) {
    const member = await this.getConversationMember(conversation, user);
    if (!member) return null;

    return member.role;
  }

  async setAction(
    conversation: ConversationEntity,
    user: UserEntity,
    action: ConversationAction = ConversationAction.NONE
  ) {
    return await this.conversationsRepository
      .createQueryBuilder("conversation_members")
      .update(ConversationMembersEntity)
      .set({ action })
      .where("conversation = :conversationId", {
        conversationId:
          typeof conversation == "number" ? conversation : conversation.id,
      })
      .andWhere("user = :userId", {
        userId: typeof user == "number" ? user : user.id,
      })
      .execute();
  }

  async quite(conversation: ConversationEntity, user: UserEntity) {
    const role = await this.getRole(conversation, user);
    if (!role) return null;

    const sockets = await this.socketService.findRoomSockets(
      `conversation_${conversation.id}`
    );

    const single_user = sockets[1] < 2;
    const dm = conversation.visibility == ConversationVisibility.DIRECT_MESSAGE;

    if (single_user || dm) await this.deleteConversation(conversation);
    else await this.deleteMember(conversation, user);

    return sockets[0];
  }
}
