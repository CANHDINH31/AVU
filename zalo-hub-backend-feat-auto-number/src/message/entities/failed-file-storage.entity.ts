import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('failed_file_storage')
export class FailedFileStorage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'path', type: 'text' })
  path: string;

  @ManyToOne(() => Message, { eager: false })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
