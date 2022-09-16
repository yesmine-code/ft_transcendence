import { Repository } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { ForbiddenException, Injectable } from "@nestjs/common";

import { UserEntity } from "@/entities/user.entity";
import { ConnectionEntity, ConnectionType } from "@/entities/connection.entity";

import { UsersService } from "@/users/users.service";

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(ConnectionEntity)
    private connectionRepository: Repository<ConnectionEntity>,

    private userService: UsersService
  ) {}

  /**
   * Get list of friend requests
   * @param target Target user
   * @param type Type of connection
   * @param last Last request to be loaded
   * @returns Friend requests
   */
  async getFriendRequests(
    target: UserEntity | number,
    type: ConnectionType,
    last?: number
  ): Promise<any[]> {
    const query = this.connectionRepository
      .createQueryBuilder("connections")
      .leftJoinAndSelect("connections.source", "users")
      .where("connections.target = :targetId", {
        targetId: typeof target == "number" ? target : target.id,
      })
      .andWhere("connections.type = :type", { type })
      .select([
        "json_build_object( \
					'id', users.id, \
					'username', users.username, \
					'display_name', users.display_name, \
					'avatar', concat('/users/avatar/', users.id, '/', users.avatar) \
				) as user",
        'connections.id as "id"',
        'connections.type as "type"',
      ])
      .addOrderBy("id", "DESC")
      .limit(20);

    if (last && last > 0) query.andWhere("connections.id < :last", { last });

    return await query.getRawMany();
  }

  /**
   * Creates a new connection using intra API
   * @param source Intra profile.
   * @returns Connection
   */
  async setConnection(
    source: UserEntity,
    target: UserEntity,
    type: ConnectionType
  ): Promise<ConnectionEntity> {
    const connection = this.connectionRepository.create({
      source,
      target,
      type,
    });

    return await this.connectionRepository.save(connection);
  }

  /**
   * Answer to friend request
   * @param source Source user
   * @param target Target user
   * @param type Type of answer
   */
  async answerToFriendRequest(source: number, target: number, type: 1 | 2) {
    const data = await this.getOneFriendship(source, target);

    data.type = type;

    await this.connectionRepository.save(data);
  }

  /**
   * Get connection by source and target from database
   * @param source Source user
   * @param target Target user
   * @param type Type of connection
   * @returns Connection data
   */
  async findOne(
    source: UserEntity | number,
    target: UserEntity | number,
    type?: ConnectionType
  ): Promise<ConnectionEntity> {
    if (typeof source == "number")
      source = await this.userService.findOneById(source);

    if (typeof target == "number")
      target = await this.userService.findOneById(target);

    const condition = { source, target };
    if (type) condition["type"] = type;

    return await this.connectionRepository.findOne({
      where: condition,
      relations: ["source", "target"],
    });
  }

  async getFriends(target: UserEntity | number, last?: number): Promise<any[]> {
    const query = this.connectionRepository
      .createQueryBuilder("connections")
      .leftJoinAndSelect("connections.source", "s")
      .leftJoinAndSelect("connections.target", "t")
      .where(
        "(connections.target = :targetId OR connections.source = :sourceId)",
        {
          targetId: typeof target == "number" ? target : target.id,
          sourceId: typeof target == "number" ? target : target.id,
        }
      )
      .andWhere("connections.type = :type", { type: ConnectionType.FRIEND })
      .select([
        "( \
					case t.id \
						when " +
          (typeof target == "number" ? target : target.id) +
          " then \
							json_build_object( \
								'id', s.id, \
								'username', s.username, \
								'display_name', s.display_name, \
								'avatar', concat('/users/avatar/', s.id, '/', s.avatar) \
							) \
						else \
							json_build_object( \
								'id', t.id, \
								'username', t.username, \
								'display_name', t.display_name, \
								'avatar', concat('/users/avatar/', t.id, '/', t.avatar) \
							) \
					end \
				) as user",
        'connections.id as "id"',
        'connections.type as "type"',
      ])
      .addOrderBy("id", "DESC")
      .limit(20);

    if (last && last > 0) query.andWhere("connections.id < :last", { last });

    return await query.getRawMany();
  }

  /**
   * Get list of blocked people
   * @param source Target user
   * @param last Last block to be loaded
   * @returns Blocked people
   */
  async getBlocked(source: UserEntity | number, last?: number): Promise<any[]> {
    const query = this.connectionRepository
      .createQueryBuilder("connections")
      .leftJoinAndSelect("connections.target", "t")
      .where("connections.source = :sourceId", {
        sourceId: typeof source == "number" ? source : source.id,
      })
      .andWhere("connections.type = :type", { type: ConnectionType.BLOCKED })
      .select([
        "json_build_object( \
					'id', t.id, \
					'username', t.username, \
					'display_name', t.display_name, \
					'avatar', concat('/users/avatar/', t.id, '/', t.avatar) \
				) as user",
        'connections.id as "id"',
        'connections.type as "type"',
      ])
      .addOrderBy("id", "DESC")
      .limit(20);

    if (last && last > 0) query.andWhere("connections.id < :last", { last });

    return await query.getRawMany();
  }

  /**
   * Get connection by source and target from database
   * @param source Source user
   * @param target Target user
   * @returns Connection data
   */
  async getOneFriendship(
    source: UserEntity | number,
    target: UserEntity | number
  ): Promise<ConnectionEntity | null> {
    if (typeof source == "number")
      source = await this.userService.findOneById(source);

    if (typeof target == "number")
      target = await this.userService.findOneById(target);

    return await this.connectionRepository.findOne({
      where: [
        { source, target },
        { source: target, target: source },
      ],
      relations: ["source", "target"],
    });
  }

  /**
   * Get connections by source and target from database
   * @param source Source user
   * @param target Target user
   * @returns Connection data
   */
  async getManyFriendship(
    source: UserEntity | number,
    target: UserEntity | number
  ): Promise<ConnectionEntity[]> {
    if (typeof source == "number")
      source = await this.userService.findOneById(source);

    if (typeof target == "number")
      target = await this.userService.findOneById(target);

    return (
      (await this.connectionRepository.find({
        where: [
          { source, target },
          { source: target, target: source },
        ],
        relations: ["source", "target"],
      })) || []
    );
  }

  /**
   * Add friend
   * @param source Source user
   * @param target Target user
   * @returns Connection data
   */
  async addFriend(source: UserEntity, target: UserEntity) {
    const friendship = await this.getOneFriendship(source, target);

    if (!friendship) {
      return await this.setConnection(source, target, ConnectionType.PENDING);
    }

    if (
      [
        ConnectionType.BLOCKED,
        ConnectionType.FRIEND,
        ConnectionType.DECLINED,
      ].includes(friendship.type)
    )
      throw new ForbiddenException();

    if (
      [ConnectionType.PENDING].includes(friendship.type) &&
      friendship.source.id == target.id
    ) {
      friendship.type = ConnectionType.FRIEND;
      await this.connectionRepository.save(friendship);
    }

    return friendship;
  }

  /**
   * Remove friend request
   * @param source Source user
   * @param target Target user
   * @returns Connection data
   */
  async removeFriend(source: UserEntity, target: UserEntity) {
    const friendship = await this.getOneFriendship(source, target);
    if (
      !friendship ||
      ![ConnectionType.PENDING, ConnectionType.FRIEND].includes(friendship.type)
    )
      throw new ForbiddenException();

    return await this.connectionRepository.delete({ id: friendship.id });
  }

  /**
   * Removes all connections with that user and block this later
   * @param source Source user
   * @param target Target user
   * @returns Connection data
   */
  async addBlock(source: UserEntity, target: UserEntity) {
    const data: ConnectionEntity[] = await this.getManyFriendship(
      source,
      target
    );

    const result = data.reduce(
      (previous: any, current: any) => {
        const from_source =
          !previous.from_source &&
          current.source.id == source.id &&
          current.target.id == target.id &&
          current.type == ConnectionType.BLOCKED;

        const from_target =
          !previous.from_target &&
          current.source.id == target.id &&
          current.target.id == source.id &&
          current.type == ConnectionType.BLOCKED;

        if (from_source) previous.from_source = current;

        if (from_target) previous.from_target = current;

        if (!from_source && !from_target) previous.to_remove.push(current);

        return previous;
      },
      { to_remove: [], from_source: null, from_target: null } as {
        to_remove: ConnectionEntity[];
        from_source?: ConnectionEntity;
        from_target?: ConnectionEntity;
      }
    );

    await Promise.all(
      result.to_remove.map(async (t: ConnectionEntity) => {
        await this.connectionRepository.delete({ id: t.id });
      })
    );

    if (!result.from_source)
      result.from_source = await this.setConnection(
        source,
        target,
        ConnectionType.BLOCKED
      );

    return result.from_source;
  }

  /**
   * Unblock a user
   * @param source Source user
   * @param target Target user
   * @returns Connection data
   */
  async removeBlock(source: UserEntity, target: UserEntity) {
    const friendship = await this.findOne(source, target);
    if (!friendship || ![ConnectionType.BLOCKED].includes(friendship.type))
      throw new ForbiddenException();

    return await this.connectionRepository.delete({ id: friendship.id });
  }

  async blocked(source: UserEntity) {
    return (
      (await this.connectionRepository.find({
        where: {
          source: {
            id: source.id,
          },
          type: 3,
        },
        relations: ["target"],
      })) || []
    );
  }
}
