import { Account } from '../../account/entities/account.entity';
import { Territory } from '../../territory/entities/territory.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '0: inactive, 1: active',
  })
  active: number;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  // Territories that this user manages
  @OneToMany(() => Territory, (territory) => territory.manager)
  managedTerritories: Territory[];

  // Territories that this user belongs to
  @ManyToMany(() => Territory, (territory) => territory.users)
  @JoinTable({
    name: 'territory_users',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'territoryId', referencedColumnName: 'id' },
  })
  territories: Territory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
