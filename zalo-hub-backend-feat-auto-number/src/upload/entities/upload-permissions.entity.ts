import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('upload_permissions')
@Index(['userId'], { unique: true })
export class UploadPermissions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Quyền đọc/xem
  @Column({ type: 'boolean', default: false })
  canRead: boolean;

  // Quyền tạo
  @Column({ type: 'boolean', default: false })
  canCreate: boolean;

  // Quyền sửa
  @Column({ type: 'boolean', default: false })
  canEdit: boolean;

  // Quyền xóa
  @Column({ type: 'boolean', default: false })
  canDelete: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
