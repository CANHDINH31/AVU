import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Account } from '../../account/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberMessage } from './phone-number-message.entity';

@Entity('phone_numbers')
@Index(['phoneNumber', 'accountId'], { unique: true })
export class PhoneNumber {
  @ApiProperty({ description: 'The unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Phone number' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ description: 'Name of the customer', required: false })
  @Column({ nullable: true })
  name: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ description: 'Cover URL', required: false })
  @Column({ nullable: true })
  cover: string;

  @ApiProperty({ description: 'Status', required: false })
  @Column({ nullable: true })
  status: string;

  @ApiProperty({ description: 'Gender', required: false })
  @Column({ nullable: true })
  gender: number;

  @ApiProperty({ description: 'Date of birth', required: false })
  @Column({ nullable: true })
  dob: number;

  @ApiProperty({ description: 'String date of birth', required: false })
  @Column({ nullable: true })
  sdob: string;

  @ApiProperty({ description: 'Global ID', required: false })
  @Column({ nullable: true })
  globalId: string;

  @ApiProperty({ description: 'Business package', required: false })
  @Column({ type: 'text', nullable: true })
  bizPkg: string;

  @ApiProperty({ description: 'Zalo UID', required: false })
  @Column({ nullable: true })
  uid: string;

  @ApiProperty({ description: 'Zalo name', required: false })
  @Column({ nullable: true })
  zaloName: string;

  @ApiProperty({ description: 'Display name', required: false })
  @Column({ nullable: true })
  displayName: string;

  @ApiProperty({ description: 'Notes', required: false })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({
    description: 'Whether friend request has been sent',
    default: false,
  })
  @Column({ default: 0, comment: '0: not sent, 1: sent' })
  hasSentFriendRequest: number;

  @ApiProperty({
    description: 'Total friend requests sent for this phone number',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  friendRequestsSent: number;

  @ApiProperty({
    description: 'Total times this phone number was unfriended',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  friendRequestsCanceled: number;

  @ApiProperty({
    description: 'Automatic friend requests sent to this phone number',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoFriendRequestsSent: number;

  @ApiProperty({
    description: 'Automatic friend request cancellations for this phone number',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoFriendRequestsCanceled: number;

  @ApiProperty({
    description: 'Manual friend requests sent to this phone number',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualFriendRequestsSent: number;

  @ApiProperty({
    description: 'Manual friend request cancellations for this phone number',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualFriendRequestsCanceled: number;

  @ApiProperty({
    description: 'Timestamp of the last friend request sent to this number',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastFriendRequestSentAt: Date;

  @ApiProperty({
    description: 'Whether this phone number is already a friend',
    default: false,
  })
  @Column({ default: false })
  isFriend: boolean;

  @ApiProperty({
    description: 'Total times this phone number has been scanned',
    default: 0,
  })
  @Column({ default: 0 })
  scanCount: number;

  @ApiProperty({
    description: 'Whether scanning has successfully retrieved information',
    default: false,
  })
  @Column({ default: false })
  hasScanInfo: boolean;

  @ApiProperty({
    description: 'Number of messages sent',
    default: 0,
  })
  @Column({ default: 0 })
  messagesSent: number;

  @ApiProperty({
    description: 'Timestamp of the most recent message attempt',
    required: false,
  })
  @Column({ type: 'timestamp', nullable: true })
  lastMessageSentAt: Date;

  @ApiProperty({
    description: 'Whether the last message was sent successfully',
    default: false,
  })
  @Column({ default: false })
  lastMessageSuccess: boolean;

  @ApiProperty({
    description:
      'Whether this phone number has blocked receiving messages from you',
    default: false,
  })
  @Column({ default: false })
  hasMessageBlockedError: boolean;

  @ApiProperty({
    description:
      'Whether this phone number has blocked messages from strangers',
    default: false,
  })
  @Column({ default: false })
  hasStrangerBlockedError: boolean;

  @ApiProperty({
    description:
      'Whether Zalo returned success but without msgId (message may not be sent)',
    default: false,
  })
  @Column({ default: false })
  hasNoMsgIdError: boolean;

  @ApiProperty({ description: 'User who created this record' })
  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ description: 'Account ID associated with this phone number' })
  @Column({ nullable: true })
  accountId: number;

  @ManyToOne(() => Account, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @OneToMany(() => PhoneNumberMessage, (message) => message.phoneNumber, {
    cascade: true,
  })
  messageHistory: PhoneNumberMessage[];

  @ApiProperty({ description: 'Last scanned timestamp', required: false })
  @Column({ type: 'timestamp', nullable: true })
  lastScannedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
