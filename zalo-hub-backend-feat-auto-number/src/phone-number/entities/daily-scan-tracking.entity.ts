import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export interface DailyScanPhoneDetail {
  phoneNumberId: number;
  phoneNumberStr: string;
  scannedAt: Date;
}

export interface FriendRequestDetail {
  phoneNumberId: number;
  phoneNumberStr: string;
  actionAt: Date;
}

@Entity('daily_scan_tracking')
@Index(['accountId', 'trackingDate'], { unique: true })
export class DailyScanTracking {
  @ApiProperty({ description: 'The unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Account ID' })
  @Column()
  accountId: number;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @ApiProperty({
    description: 'Tracking date for this record',
  })
  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  trackingDate: Date;

  @ApiProperty({
    description: 'Number of automatic scans performed today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  dailyScanCount: number;

  @ApiProperty({
    description: 'Number of manual scans performed today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualScanCount: number;

  @ApiProperty({
    description: 'Whether automatic daily scanning is enabled',
    default: true,
  })
  @Column({ type: 'boolean', default: false })
  scanEnabled: boolean;

  @ApiProperty({
    description: 'Total number of phone numbers scanned (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  totalScanned: number;

  @ApiProperty({
    description: 'Total numbers that returned information (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  withInfo: number;

  @ApiProperty({
    description: 'Total numbers without information (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  withoutInfo: number;

  @ApiProperty({
    description: 'Last date when daily stats were updated',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  lastScanDate: Date | null;

  @ApiProperty({
    description: 'Detailed list of phone numbers with information (auto scans)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  withInfoDetails: DailyScanPhoneDetail[];

  @ApiProperty({
    description:
      'Detailed list of phone numbers without information (auto scans)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  withoutInfoDetails: DailyScanPhoneDetail[];

  @ApiProperty({
    description: 'Detailed list of phone numbers with info (manual scans)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  manualWithInfoDetails: DailyScanPhoneDetail[];

  @ApiProperty({
    description: 'Detailed list of phone numbers without info (manual scans)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  manualWithoutInfoDetails: DailyScanPhoneDetail[];

  @ApiProperty({
    description: 'Number of automatic friend requests sent today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoFriendRequestsSentToday: number;

  @ApiProperty({
    description: 'Number of automatic friend request cancellations today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoFriendRequestsCanceledToday: number;

  @ApiProperty({
    description: 'Total automatic friend requests sent (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoFriendRequestsSentTotal: number;

  @ApiProperty({
    description: 'Total automatic friend request cancellations (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoFriendRequestsCanceledTotal: number;

  @ApiProperty({
    description: 'Automatic friend request detail list (sent)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  autoFriendRequestDetails: FriendRequestDetail[];

  @ApiProperty({
    description: 'Automatic friend request detail list (cancelled)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  autoFriendCancelDetails: FriendRequestDetail[];

  @ApiProperty({
    description: 'Number of manual friend requests sent today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualFriendRequestsSentToday: number;

  @ApiProperty({
    description: 'Number of manual friend request cancellations today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualFriendRequestsCanceledToday: number;

  @ApiProperty({
    description: 'Total manual friend requests sent (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualFriendRequestsSentTotal: number;

  @ApiProperty({
    description: 'Total manual friend request cancellations (all time)',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualFriendRequestsCanceledTotal: number;

  @ApiProperty({
    description: 'Number of manual messages sent today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  manualMessageToday: number;

  @ApiProperty({
    description: 'Number of automatic messages sent today',
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  autoMessageToday: number;

  @ApiProperty({
    description: 'Maximum number of automatic messages per day',
    default: 160,
  })
  @Column({ type: 'int', default: 160 })
  limitAutoMessageToday: number;

  @ApiProperty({
    description: 'Manual friend request detail list (sent)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  manualFriendRequestDetails: FriendRequestDetail[];

  @ApiProperty({
    description: 'Manual friend request detail list (cancelled)',
    type: 'array',
  })
  @Column({ type: 'json', default: () => "'[]'" })
  manualFriendCancelDetails: FriendRequestDetail[];

  @ApiProperty({
    description: 'Maximum number of automatic friend requests per day',
    default: 40,
  })
  @Column({ type: 'int', default: 40 })
  autoFriendRequestDailyLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
