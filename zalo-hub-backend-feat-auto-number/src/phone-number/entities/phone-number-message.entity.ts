import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PhoneNumber } from './phone-number.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('phone_number_messages')
export class PhoneNumberMessage {
  @ApiProperty({ description: 'The unique identifier' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Phone number ID' })
  @Column()
  phoneNumberId: number;

  @ManyToOne(() => PhoneNumber, (phoneNumber) => phoneNumber.messageHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'phoneNumberId' })
  phoneNumber: PhoneNumber;

  @ApiProperty({ description: 'Message content' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({ description: 'Message type', required: false })
  @Column({ nullable: true })
  type: string;

  @ApiProperty({
    description: 'Message mode: manual or auto',
    required: false,
    enum: ['manual', 'auto'],
    default: 'manual',
  })
  @Column({ type: 'varchar', length: 10, default: 'manual' })
  mode: 'manual' | 'auto';

  @ApiProperty({ description: 'Account ID that sent the message' })
  @Column({ nullable: true })
  accountId: number;

  @ApiProperty({ description: 'Status of the message', required: false })
  @Column({ nullable: true, default: 'sent' })
  status: string;

  @ApiProperty({
    description: 'Whether the message was sent successfully',
    required: false,
  })
  @Column({ type: 'boolean', nullable: true })
  isSuccess: boolean | null;

  @ApiProperty({ description: 'Error message if failed', required: false })
  @Column({ type: 'text', nullable: true })
  error: string;

  @ApiProperty({
    description: 'Raw response returned by the provider when sending message',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  responsePayload: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
