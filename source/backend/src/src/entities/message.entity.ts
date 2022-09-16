import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinTable,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { ConversationEntity } from "./conversation.entity";
import { GameEntity } from "./game.entity";
import { UserEntity } from "./user.entity";

@Entity("messages")
export class MessageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* Value */
  @Column({ nullable: true })
  value: string;

  /* Author */
  @ManyToOne(() => UserEntity, (userEntity) => userEntity.createMessage)
  author: UserEntity;

  /* Date */
  @CreateDateColumn()
  date: Date;

  /* Conversation */
  @ManyToOne((type) => ConversationEntity, {
    eager: false,
    onDelete: "CASCADE",
  })
  @JoinTable()
  conversation: ConversationEntity;

  /* Game */
  @ManyToOne((type) => GameEntity, {
    eager: false,
    nullable: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "game_id" })
  game: GameEntity | null;

  @Column({
    nullable: true,
    select: false,
  })
  game_id: number | null;
}
