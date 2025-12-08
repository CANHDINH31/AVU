import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { Conversation } from "./conversation.entity";
import { Message } from "./message.entity";

@Entity("reactions")
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "action_id" })
  actionId: string;

  @Column({ name: "msg_id" })
  msgId: string;

  @Column({ name: "message_id" })
  messageId: number;

  @Column({ name: "cli_msg_id" })
  cliMsgId: string;

  @Column({ name: "msg_type", nullable: true })
  msgType: string;

  @Column({ name: "uid_from" })
  uidFrom: string;

  @Column({ name: "id_to" })
  idTo: string;

  @Column({ name: "ts" })
  ts: string;

  @Column({ name: "r_icon" })
  rIcon: string;

  @Column({ name: "msg_sender" })
  msgSender: string;

  @Column({ name: "r_type", type: "int" })
  rType: number;

  @Column({ name: "source", type: "int", nullable: true })
  source: number;

  @Column({ name: "ttl", type: "int", nullable: true })
  ttl: number;

  @Column({ name: "thread_id" })
  threadId: string;

  @Column({ name: "is_self", type: "int" })
  isSelf: number;

  @Column({ name: "r_msg", type: "json", nullable: true })
  rMsg: any[];

  @Column({ name: "g_msg_id", nullable: true })
  gMsgID: string;

  @Column({ name: "c_msg_id", nullable: true })
  cMsgID: string;

  @Column({ name: "d_name", nullable: true })
  dName: string;

  @Column({ name: "is_read", type: "int", default: 0 })
  isRead: number;

  @Column({ name: "conversation_id", nullable: true })
  conversationId: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.reactions, {
    eager: false,
    nullable: true,
  })
  @JoinColumn({ name: "conversation_id", referencedColumnName: "id" })
  conversation: Conversation;

  @ManyToOne(() => Message, (message) => message.reactions, { eager: false })
  @JoinColumn({ name: "message_id", referencedColumnName: "id" })
  message: Message;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
