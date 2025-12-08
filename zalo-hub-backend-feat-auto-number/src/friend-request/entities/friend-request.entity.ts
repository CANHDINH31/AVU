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

@Entity('friend_requests')
export class FriendRequest {
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
  phoneNumber: string;

  @ApiProperty()
  @Column({ nullable: true })
  status: string;

  @ApiProperty()
  @Column({ nullable: true })
  gender: number;

  @ApiProperty()
  @Column({ nullable: true })
  dob: number;

  @ApiProperty()
  @Column({ nullable: true })
  type: number;

  @ApiProperty()
  @Column({ nullable: true })
  recommType: number;

  @ApiProperty()
  @Column({ nullable: true })
  recommSrc: number;

  @ApiProperty()
  @Column({ nullable: true })
  recommTime: number;

  @ApiProperty()
  @Column({ nullable: true })
  recommInfo: string;

  @ApiProperty()
  @Column({ nullable: true })
  bizPkg: string;

  @ApiProperty()
  @Column({ default: 0 })
  isSeenFriendReq: number;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
