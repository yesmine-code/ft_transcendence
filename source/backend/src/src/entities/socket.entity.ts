import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinTable,
} from "typeorm";

import { UserEntity } from "./user.entity";

export * from "./connection.utils";

@Entity("sockets")
export class SocketEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* Socket */
  @Column({ nullable: false })
  socket: string;

  /* Source */
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.createConnection, {
    eager: false,
    onDelete: "CASCADE",
  })
  @JoinTable()
  source: UserEntity;

  /* Room */
  @Column({ nullable: true })
  room: string;
}
