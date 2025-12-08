import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Conversation } from '../../conversation/entities/conversation.entity';
import { User } from '../../user/entities/user.entity';
import { Reaction } from '../../reaction/entities/reaction.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  type: number;

  @Column({ name: 'thread_id' })
  threadId: string;

  @Column({ name: 'is_self', type: 'int' }) // 0: false, 1: true
  isSelf: number; // 0: không phải self, 1: là self

  @Column({ name: 'action_id' })
  actionId: string;

  @Column({ name: 'msg_id' })
  msgId: string;

  @Column({ name: 'cli_msg_id' })
  cliMsgId: string;

  @Column({ name: 'uid_from' })
  uidFrom: string;

  @Column({ name: 'id_to' })
  idTo: string;

  @Column({ name: 'd_name' })
  dName: string;

  @Column({ name: 'ts' })
  ts: string;

  @Column({ type: 'int' })
  status: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'title', type: 'text', nullable: true })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'href', type: 'text', nullable: true })
  href: string;

  @Column({ name: 'thumb', type: 'text', nullable: true })
  thumb: string;

  @Column({ name: 'childnumber', type: 'int', nullable: true })
  childnumber: number;

  @Column({ name: 'action', type: 'text', nullable: true })
  action: string;

  @Column({ name: 'params', type: 'text', nullable: true })
  params: string;

  @Column({ name: 'conversation_id' })
  conversationId: number;

  @Column({
    name: 'message_status',
    type: 'enum',
    enum: ['sending', 'sent', 'failed'],
    nullable: true,
  })
  messageStatus?: 'sending' | 'sent' | 'failed';

  @Column({
    name: 'source',
    type: 'enum',
    enum: ['backend', 'socket'],
    nullable: true,
    default: 'socket',
  })
  source?: 'backend' | 'socket';

  @Column({ name: 'sender_id', nullable: true })
  senderId: number;

  @Column({ name: 'is_read', type: 'int', default: 0 })
  isRead: number;

  @Column({ name: 'msg_type', nullable: true })
  msgType: string;

  @Column({ name: 'cmd', type: 'int', nullable: true })
  cmd: number;

  @Column({ name: 'st', type: 'int', nullable: true })
  st: number;

  @Column({ name: 'at', type: 'int', nullable: true })
  at: number;

  @Column({ nullable: true })
  stickerId: number;

  @Column({ nullable: true })
  cateId: number;

  @Column({ nullable: true })
  stickerType: number;

  @Column({ nullable: true })
  stickerUrl: string;

  @Column({ nullable: true })
  stickerSpriteUrl: string;

  @Column({ nullable: true })
  stickerWebpUrl: string;

  @Column({ nullable: true })
  stickerTotalFrames: number;

  @Column({ nullable: true })
  stickerDuration: number;

  @Column({ name: 'file_size', type: 'text', nullable: true })
  fileSize: string;

  @Column({ name: 'check_sum', type: 'text', nullable: true })
  checkSum: string;

  @Column({ name: 'checksum_sha', type: 'text', nullable: true })
  checksumSha: string;

  @Column({ name: 'file_ext', type: 'text', nullable: true })
  fileExt: string;

  @Column({ name: 'fdata', type: 'text', nullable: true })
  fdata: string;

  @Column({ name: 'f_type', type: 'int', nullable: true })
  fType: number;

  @Column({ name: 't_width', type: 'int', nullable: true })
  tWidth: number;

  @Column({ name: 't_height', type: 'int', nullable: true })
  tHeight: number;

  @Column({ name: 'video_duration', type: 'int', nullable: true })
  videoDuration: number;

  @Column({ name: 'v_width', type: 'int', nullable: true })
  vWidth: number;

  @Column({ name: 'v_height', type: 'int', nullable: true })
  vHeight: number;

  @Column({ name: 'undo', type: 'int', default: 0 })
  undo: number;

  @Column({ name: 'quote_owner_id', type: 'bigint', nullable: true })
  quoteOwnerId: string; // dùng string vì JS không chính xác với số lớn > 2^53

  @Column({ name: 'quote_cli_msg_id', type: 'bigint', nullable: true })
  quoteCliMsgId: string;

  @Column({ name: 'quote_global_msg_id', type: 'bigint', nullable: true })
  quoteGlobalMsgId: string;

  @Column({ name: 'quote_cli_msg_type', type: 'int', nullable: true })
  quoteCliMsgType: number;

  @Column({ name: 'quote_ts', type: 'bigint', nullable: true })
  quoteTs: string;

  @Column({ name: 'quote_msg', type: 'text', nullable: true })
  quoteMsg: string;

  @Column({ name: 'quote_attach', type: 'text', nullable: true })
  quoteAttach: string;

  @Column({
    name: 'quote_from_d',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  quoteFromD: string;

  @Column({ name: 'quote_ttl', type: 'int', nullable: true })
  quoteTtl: number;

  @Column({ name: 'property_ext_json', type: 'text', nullable: true })
  propertyExtJson: string;

  @Column({ name: 'content_json', type: 'text', nullable: true })
  contentJson: string;

  @Column({ name: 'ttl', type: 'int', nullable: true })
  ttl: number;

  @Column({ name: 'is_expired', type: 'int', default: 1 })
  isExpired: number; // 1: còn hạn, 0: hết hạn

  @Column({ name: 'reply_to_id', type: 'int', nullable: true })
  replyToId: number;

  @ManyToOne(() => Message, (message) => message.replies, { nullable: true })
  @JoinColumn({ name: 'reply_to_id' })
  replyTo: Message;

  @OneToMany(() => Message, (message) => message.replyTo)
  replies: Message[];

  @ManyToOne(() => Conversation, { eager: false })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Reaction, (reaction) => reaction.message)
  reactions: Reaction[];
}
