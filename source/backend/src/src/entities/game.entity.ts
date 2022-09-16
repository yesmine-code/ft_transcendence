import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { PlayerStatus } from "./game.utils";
import { SocketEntity } from "./socket.entity";
import { UserEntity } from "./user.entity";

@Entity("games")
export class GameEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /*** First Player ***/
  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.id, {
    nullable: true,
  })
  @JoinColumn({ name: "first_player_id" })
  first_player: UserEntity | null;

  @Column({
    nullable: true,
    select: false,
  })
  first_player_id: number | null;

  /* Status */
  @Column({
    type: "enum",
    enum: PlayerStatus,
    default: null,
  })
  first_player_status: PlayerStatus;

  /* Socket */
  @ManyToOne(() => SocketEntity, (SocketEntity) => SocketEntity.id, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "first_player_socket_id" })
  first_player_socket: SocketEntity;

  @Column({
    nullable: true,
    select: false,
  })
  first_player_socket_id: number | null;

  /* Score */
  @Column({ nullable: false, default: 0 })
  first_player_score: number;

  /*** Second Player ***/
  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.id, {
    nullable: true,
  })
  @JoinColumn({ name: "second_player_id" })
  second_player: UserEntity | null;

  @Column({
    nullable: true,
    select: false,
  })
  second_player_id: number | null;

  /* Status */
  @Column({
    type: "enum",
    enum: PlayerStatus,
    default: null,
  })
  second_player_status: PlayerStatus;

  /* Score */
  @Column({ nullable: false, default: 0 })
  second_player_score: number;

  /* Socket */
  @ManyToOne(() => SocketEntity, (SocketEntity) => SocketEntity.id, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "second_player_socket_id" })
  second_player_socket: SocketEntity;

  @Column({
    nullable: true,
    select: false,
  })
  second_player_socket_id: number | null;

  /*** Second Player Requested ***/
  @ManyToOne(() => UserEntity, (UserEntity) => UserEntity.id, {
    nullable: true,
  })
  @JoinColumn({ name: "second_player_requested_id" })
  second_player_requested: UserEntity | null;

  @Column({
    nullable: true,
    select: false,
  })
  second_player_requested_id: number | null;

  /* Created */
  @CreateDateColumn({ nullable: true, default: null })
  created: Date;

  /* Started */
  @CreateDateColumn({ nullable: true, default: null })
  start: Date;

  /* Finished */
  @CreateDateColumn({ nullable: true, default: null })
  finish: Date;
}
