import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { Friend } from '../../friend/entities/friend.entity';
import { Message } from '../../message/entities/message.entity';
import { Reaction } from '../../reaction/entities/reaction.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @ManyToOne(() => Account, { eager: false })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column()
  friend_id: number;

  @ManyToOne(() => Friend, { eager: false })
  @JoinColumn({ name: 'friend_id' })
  friend: Friend;

  @Column()
  userZaloId: string;

  @Column()
  userKey: string;

  @Column({ name: 'is_pinned', type: 'int', default: 0 })
  isPinned: number;

  @Column({ default: 1 })
  isFr: number;
  // 1: bạn bè
  // 0: không phải bạn bè
  // 2: Đã gởi lời mời

  @OneToMany(() => Message, (message) => message.conversation, {
    eager: false,
    cascade: true,
  })
  messages: Message[];

  @OneToMany(() => Reaction, (reaction) => reaction.conversation, {
    eager: false,
    cascade: true,
  })
  reactions: Reaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
