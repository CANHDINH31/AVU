import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sent_friend_requests')
export class SentFriendRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Người gửi lời mời kết bạn (account_id)' })
  @Column()
  accountId: number;

  @ApiProperty({ description: 'Account gởi lời mời kết bạn' })
  @ManyToOne(() => Account, (account) => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ApiProperty()
  @Column()
  userId: string;

  @ApiProperty()
  @Column()
  zaloName: string;

  @ApiProperty()
  @Column({ nullable: true })
  displayName: string;

  @ApiProperty()
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty()
  @Column({ nullable: true })
  globalId: string;

  @ApiProperty()
  @Column({ nullable: true })
  bizPkg: string;

  @ApiProperty()
  @Column({ nullable: true })
  fReqInfo: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
