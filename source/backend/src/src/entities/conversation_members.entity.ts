import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { ConversationEntity } from "./conversation.entity";
import {
  ConversationAction,
  ConversationRole,
} from "./conversation_members.utils";
import { UserEntity } from "./user.entity";

@Entity("conversation_members")
export class ConversationMembersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* User */
  @ManyToOne(() => UserEntity, {
    onDelete: "CASCADE",
  })
  user: UserEntity;

  /* Conversation */
  @ManyToOne(() => ConversationEntity, {
    onDelete: "CASCADE",
  })
  conversation: ConversationEntity;

  /* Action */
  @Column({
    type: "enum",
    enum: ConversationAction,
    default: ConversationAction.NONE,
  })
  action: ConversationAction;

  /* Role */
  @Column({
    type: "enum",
    enum: ConversationRole,
    default: ConversationRole.MEMBER,
  })
  role: ConversationRole;

  /* Joined */
  @CreateDateColumn()
  joined: Date;
}
