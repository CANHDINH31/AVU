import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Friend } from '../../friend/entities/friend.entity';
import { FriendRequest } from '../../friend-request/entities/friend-request.entity';
import { SentFriendRequest } from '../../sent-friend-request/entities/sent-friend-request.entity';

@Entity('accounts')
export class Account {
  @ApiProperty({ description: 'The unique identifier of the account' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'The ID of the user who owns this account' })
  @Column({ nullable: true })
  userId: number;

  @ApiProperty({ description: 'The ID of the user who owns this account' })
  @Column()
  userZaloId: string;

  @ApiProperty({ description: 'The status of the account', required: false })
  @Column({ nullable: true })
  accountStatus: number;

  @ApiProperty({
    description: 'The avatar URL of the account',
    required: false,
  })
  @Column({ nullable: true })
  avatar: string;

  @ApiProperty({ description: 'The background avatar URL', required: false })
  @Column({ nullable: true })
  bgavatar: string;

  @ApiProperty({ description: 'Business package information', required: false })
  @Column('json', { nullable: true })
  bizPkg: { label: string | null; pkgId: number };

  @ApiProperty({ description: 'The cover image URL', required: false })
  @Column({ nullable: true })
  cover: string;

  @ApiProperty({ description: 'Creation timestamp', required: false })
  @Column({ nullable: true })
  createdTs: number;

  @ApiProperty({
    description: 'The display name of the account',
    required: false,
  })
  @Column({ nullable: true })
  displayName: string;

  @ApiProperty({ description: 'Date of birth timestamp', required: false })
  @Column({ nullable: true })
  dob: number;

  @ApiProperty({ description: 'Gender of the account holder', required: false })
  @Column({ nullable: true })
  gender: number;

  @ApiProperty({ description: 'Global identifier', required: false })
  @Column({ nullable: true })
  globalId: string;

  @ApiProperty({
    description: 'Whether the account is active',
    required: false,
  })
  @Column({ nullable: true })
  isActive: number;

  @ApiProperty({
    description: 'Whether the account is active on PC',
    required: false,
  })
  @Column({ nullable: true })
  isActivePC: number;

  @ApiProperty({
    description: 'Whether the account is active on Web',
    required: false,
  })
  @Column({ nullable: true })
  isActiveWeb: number;

  @ApiProperty({
    description: 'Whether the account is blocked',
    required: false,
  })
  @Column({ nullable: true })
  isBlocked: number;

  @ApiProperty({ description: 'Friend status', required: false })
  @Column({ nullable: true })
  isFr: number;

  @ApiProperty({ description: 'Whether the account is valid', required: false })
  @Column({ nullable: true })
  isValid: number;

  @ApiProperty({ description: 'Account key', required: false })
  @Column({ nullable: true, type: 'int' })
  accountKey: number;

  @ApiProperty({ description: 'Last action timestamp', required: false })
  @Column({ nullable: true })
  lastActionTime: number;

  @ApiProperty({ description: 'Last update timestamp', required: false })
  @Column({ nullable: true })
  lastUpdateTime: number;

  @ApiProperty({ description: 'OA information', required: false })
  @Column('json', { nullable: true })
  oaInfo: any;

  @ApiProperty({ description: 'OA status', required: false })
  @Column('json', { nullable: true })
  oa_status: any;

  @ApiProperty({ description: 'Phone number', required: false })
  @Column({ nullable: true })
  phoneNumber: string;

  @ApiProperty({ description: 'String date of birth', required: false })
  @Column({ nullable: true })
  sdob: string;

  @ApiProperty({ description: 'Account status', required: false })
  @Column({ type: 'text', nullable: true })
  status: string;

  @ApiProperty({ description: 'Account type', required: false })
  @Column({ nullable: true })
  type: number;

  @ApiProperty({ description: 'User key', required: false })
  @Column({ nullable: true })
  userKey: string;

  @ApiProperty({ description: 'User mode', required: false })
  @Column({ nullable: true })
  user_mode: number;

  @ApiProperty({ description: 'Username', required: false })
  @Column({ nullable: true })
  username: string;

  @ApiProperty({ description: 'Zalo name', required: false })
  @Column({ nullable: true })
  zaloName: string;

  @ApiProperty({
    description: 'Whether the account is connected',
    required: false,
  })
  @Column({ default: 0 })
  isConnect: number;

  @ApiProperty({
    description: 'Whether automatic daily scanning is enabled',
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  scanEnabled: boolean;

  @ApiProperty({
    description: 'Whether automatic friend request sending is enabled',
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  autoFriendRequestEnabled: boolean;

  @ApiProperty({
    description: 'Start time for automatic friend requests (HH:00 format)',
    required: false,
  })
  @Column({ nullable: true })
  friendRequestStartTime: string;

  @ApiProperty({
    description: 'Whether automatic message sending is enabled',
    required: false,
  })
  @Column({ type: 'boolean', default: false })
  autoMessageEnabled: boolean;

  @ApiProperty({
    description: 'Bulk message content to send automatically',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  bulkMessageContent: string;

  @ApiProperty({
    description: 'Number of friend requests waiting for acceptance',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  pendingFriendRequests: number;

  @ApiProperty({
    description: 'Total number of friend requests this account has sent',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  totalFriendRequestsSent: number;

  @ApiProperty({ description: 'Associated user', type: () => User })
  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  imei: string;

  @Column({ type: 'json', nullable: true })
  cookies: any;

  @Column({ nullable: true })
  userAgent: string;

  @OneToMany(() => Friend, (friend) => friend.account)
  friends: Friend[];

  @OneToMany(() => FriendRequest, (fr) => fr.account)
  friendRequests: FriendRequest[];

  @OneToMany(() => SentFriendRequest, (sfr) => sfr.account)
  sentFriendRequests: SentFriendRequest[];

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
