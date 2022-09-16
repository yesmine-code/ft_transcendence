import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

import { ConversationVisibility } from "./conversation.utils";

@Entity("conversations")
export class ConversationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /* Name */
  @Column({ nullable: true })
  name: string;

  /* Password */
  @Column({ nullable: true })
  password: string;

  /* Visibility */
  @Column({
    type: "enum",
    enum: ConversationVisibility,
    default: ConversationVisibility.PUBLIC,
  })
  visibility: ConversationVisibility;

  /* Created */
  @CreateDateColumn()
  created: Date;
}
