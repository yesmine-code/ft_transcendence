import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";

import { UserEntity } from "./user.entity";
import { ConnectionType } from "./connection.utils";

export * from "./connection.utils";

@Entity("connections")
export class ConnectionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* Source */
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.createConnection)
  source: UserEntity;

  /* Target */
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.receiveConnection)
  target: UserEntity;

  /* Type */
  @Column("int")
  type: ConnectionType;

  /* Timestamp */
  @Column({ type: "timestamp", nullable: true })
  timestamp: Date;
}
