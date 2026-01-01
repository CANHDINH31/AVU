import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRankName {
  KIM_CUONG = 'kim_cuong',
  VANG = 'vang',
  BAC = 'bac',
  DONG = 'dong',
}

@Entity('user_ranks')
export class UserRank {
  @ApiProperty({ description: 'The unique identifier of the rank' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Tên rank (kim_cuong, vang, bac, dong)',
    enum: UserRankName,
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @ApiProperty({ description: 'Tên hiển thị của rank' })
  @Column({ type: 'varchar', length: 100 })
  displayName: string;

  @ApiProperty({ description: 'Số tài khoản tối đa được phép thêm' })
  @Column({ type: 'int', default: 0 })
  maxAccounts: number;

  @ApiProperty({ description: 'Thứ tự sắp xếp (1: cao nhất, 4: thấp nhất)' })
  @Column({ type: 'int', default: 0 })
  order: number;

  @OneToMany(() => User, (user) => user.rank)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

