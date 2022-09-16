import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";

import { UserEntity } from "./user.entity";
import { Achievement } from "./achievement.utils";

@Entity("achievements")
export class AchievementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* User */
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.getAchievments)
  user: UserEntity;

  /* Achievement */
  @Column({
    type: "enum",
    enum: Achievement,
    nullable: false,
  })
  achievement: Achievement;

  /* Timestamp */
  @Column({ type: "timestamp", nullable: true })
  timestamp: Date;
}
