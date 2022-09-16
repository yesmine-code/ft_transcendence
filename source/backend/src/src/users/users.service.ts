import * as fs from "fs";
import * as path from "path";
import { FindOneOptions, IsNull, Repository } from "typeorm";
import { Profile } from "passport-42";

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { UserEntity } from "@/entities/user.entity";

import { SocketService } from "@/socket/socket.service";
import { GameMap, Status, Theme } from "@/entities/user.utils";
import { SignUpDto } from "@/authentication/dto/signup.dto";

interface UserUpdate {
  avatar?: string;
  display_name?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    private socketService: SocketService
  ) {}

  async set42User(profile: Profile): Promise<UserEntity> {
    const user = this.usersRepository.create({
      id_42: profile.id,
      username: profile.username,
      email: profile.emails[0].value,
    });

    return await this.usersRepository.save(user);
  }

  async findOneById(
    id: number,
    options?: FindOneOptions<UserEntity>
  ): Promise<UserEntity> {
    return await this.usersRepository.findOne({
      where: [
        {
          id,
        },
      ],
      ...(options || {}),
    });
  }

  async findOneBy42Id(id_42: number): Promise<UserEntity> {
    return await this.usersRepository.findOne({ where: { id_42 } });
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findOneByUsername(username: string) {
    return await this.usersRepository.findOne({ where: { username } });
  }

  async findLike(query: string): Promise<UserEntity[]> {
    return await this.usersRepository
      .createQueryBuilder("user")
      .take(10)
      .where("user.username like :name", { name: `${query}%` })
      .andWhere("user.isFirstLogin = :isFirstLogin", { isFirstLogin: false })
      .select([
        'user.id as "id"',
        "concat('/', user.username) as \"url\"",
        "concat(user.display_name, ' (@', user.username, ')') as \"value\"",
      ])
      .getRawMany();
  }

  async removeOneById(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async deleteOldAvatar(filename: string): Promise<void> {
    try {
      fs.unlinkSync(path.join("avatars", filename));
    } catch (err) {
      console.error(err);
    }
  }

  async update(user: UserEntity, fields: UserUpdate) {
    let data: UserUpdate = {};

    if (
      fields.avatar &&
      user.avatar != null &&
      user.avatar !== "default_avatar.jpeg"
    )
      this.deleteOldAvatar(user.avatar);

    for (const field in fields) {
      user[field] = fields[field];
    }

    const results = await this.usersRepository.save(user);

    for (const field in fields) {
      if (field == "avatar")
        data[field] = path.join("/users/avatar/", `${user.id}`, fields[field]);
      else data[field] = results[field];
    }

    return data;
  }

  async setUserSigned(userdto: SignUpDto): Promise<UserEntity> {
    const user = this.usersRepository.create({
      username: userdto.username,
      email: userdto.email,
      password: userdto.password,
    });

    return await this.usersRepository.save(user);
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.usersRepository.update(userId, {
      twoFactorAuthenticationSecret: secret,
    });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.usersRepository.update(userId, {
      isTwoFactorAuthenticationEnabled: true,
    });
  }

  markPhoneNumberAsConfirmed(userId: number) {
    return this.usersRepository.update(
      { id: userId },
      { isPhoneNumberConfirmed: true }
    );
  }

  async updatePhoneNumber(userId: number, phoneNumber: string) {
    return this.usersRepository.update(
      { id: userId },
      { phoneNumber: phoneNumber }
    );
  }

  async updateLevel(userId: number, level: number) {
    return this.usersRepository.update({ id: userId }, { level: level });
  }

  async updateNumberOfGames(userId: number, number_of_games: number) {
    return this.usersRepository.update(
      { id: userId },
      { number_of_games: number_of_games }
    );
  }

  async enableTwoStepAuthentication(
    userId: number,
    isTwoFactorAuthenticationEnabled: boolean = true
  ) {
    return this.usersRepository.update(
      { id: userId },
      { isTwoFactorAuthenticationEnabled }
    );
  }

  async theme(user: UserEntity, theme: Theme) {
    user.theme = theme;
    return this.usersRepository.save(user);
  }

  async username(user: UserEntity, username: string) {
    user.username = username;
    return this.usersRepository.save(user);
  }

  async map(user: UserEntity, map: GameMap) {
    user.map = map;
    return this.usersRepository.save(user);
  }

  async updateStatus(user: UserEntity, status?: Status) {
    if (!status) status = await this.socketService.getUserStatus(user);

    await this.usersRepository
      .createQueryBuilder("users")
      .update(UserEntity)
      .set({ status })
      .where("id = :userId", {
        userId: typeof user == "number" ? user : user.id,
      })
      .execute();

    return status;
  }

  async getStatus(user: UserEntity | number) {
    if (!user) return null;

    if (typeof user !== "number") return user.status;

    const data = await this.findOneById(user);
    return !data ? null : data.status;
  }
}
