import { FindOneOptions, Not, Like, Repository, In } from "typeorm";

import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";

import { UserEntity } from "@/entities/user.entity";
import { SocketEntity } from "@/entities/socket.entity";
import { Status } from "@/entities/user.utils";

@Injectable()
export class SocketService {
  constructor(
    @InjectRepository(SocketEntity)
    private socketRepository: Repository<SocketEntity>
  ) {}

  async setSocket(socket: string, source?: UserEntity): Promise<void> {
    if (!source) {
      await this.socketRepository.delete({ socket });
    } else {
      await this.socketRepository.save(
        this.socketRepository.create({
          source,
          socket,
        })
      );
    }
  }

  async findSocketById(socket: string, options?: FindOneOptions<SocketEntity>) {
    return await this.socketRepository.findOne({
      where: { socket },
      ...(options || {}),
    });
  }

  async findRoomSockets(room: string) {
    return await this.socketRepository.findAndCount({
      where: { room },
    });
  }

  async findUserSockets(source: number | number[], room: string) {
    if (!Array.isArray(source)) source = [source];

    return await this.socketRepository.find({
      where: { source: In(source), room },
    });
  }

  async getUserStatus(user: UserEntity) {
    const sockets =
      (await this.socketRepository
        .createQueryBuilder("sockets")
        .where("sockets.sourceId = :sourceId", { sourceId: user.id })
        .getRawMany()) || [];

    if (!sockets.length) return Status.OFFLINE;

    return !sockets.filter((socket) => {
      const room = socket.sockets_room;
      return !!(room && room.startsWith("game_"));
    }).length
      ? Status.ONLINE
      : Status.IN_GAME;
  }

  async isOnline(source: UserEntity): Promise<boolean> {
    return (await this.socketRepository.findOne({ where: { source } })) != null;
  }

  async getSocketRoom(room?: string): Promise<SocketEntity[]> {
    return (
      (await this.socketRepository
        .createQueryBuilder("sockets")
        .where("sockets.room = :room", { room })
        .getMany()) || []
    );
  }

  async setRoom(socket_id: string, room: string = null) {
    return await this.socketRepository
      .createQueryBuilder("sockets")
      .update(SocketEntity)
      .set({ room })
      .where("socket = :socketId", { socketId: socket_id })
      .execute();
  }

  async clear() {
    await this.socketRepository
      .createQueryBuilder("sockets")
      .delete()
      .from(SocketEntity)
      .execute();
  }
}
