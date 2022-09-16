import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AchievementEntity } from "./achievement.entity";
import { ConnectionEntity } from "./connection.entity";
import { MessageEntity } from "./message.entity";
import { GameMap, Status, Theme } from "./user.utils";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  id_42: number;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: false, default: 0 })
  level: number;

  @Column({ nullable: false, default: 0 })
  number_of_games: number;

  @Column({
    unique: true,
    nullable: false,
    default: () => "transcendence_ids.unique_username()",
  })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  display_name: string;

  @Column({ nullable: false, default: "default_avatar.jpeg" })
  avatar: string;

  @Column({ nullable: true })
  public twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.OFFLINE,
  })
  status: Status;

  @Column({
    type: "enum",
    enum: Theme,
    default: Theme.AUTO,
  })
  theme: Theme;

  @Column({
    type: "enum",
    enum: GameMap,
    default: GameMap.BLACK,
  })
  map: GameMap;

  @OneToMany(
    () => ConnectionEntity,
    (connectionEntity) => connectionEntity.source
  )
  createConnection: ConnectionEntity[];

  @Column({ nullable: true })
  public phoneNumber: string;

  @Column({ default: false })
  public isPhoneNumberConfirmed: boolean;

  @Column({ default: true })
  public isFirstLogin: boolean;

  @OneToMany(
    () => ConnectionEntity,
    (connectionEntity) => connectionEntity.target
  )
  receiveConnection: ConnectionEntity[];

  @OneToMany(() => MessageEntity, (messageEntity) => messageEntity.author)
  createMessage: MessageEntity[];

  @OneToMany(
    () => AchievementEntity,
    (achievementEntity) => achievementEntity.user
  )
  getAchievments: AchievementEntity[];
}
