import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "./account.entity";

@Entity("friends")
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountId: number;

  @Column()
  userId: string;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  zaloName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bgavatar: string;

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  gender: number;

  @Column({ nullable: true })
  dob: number;

  @Column({ nullable: true })
  sdob: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: 0 })
  isFr: number;

  @Column({ default: 0 })
  isBlocked: number;

  @Column({ nullable: true })
  lastActionTime: number;

  @Column({ nullable: true })
  lastUpdateTime: number;

  @Column({ default: 0 })
  isActive: number;

  @Column({ nullable: true })
  friendKey: number;

  @Column({ default: 0 })
  type: number;

  @Column({ default: 0 })
  isActivePC: number;

  @Column({ default: 0 })
  isActiveWeb: number;

  @Column({ default: 0 })
  isValid: number;

  @Column({ nullable: true })
  userKey: string;

  @Column({ default: 0 })
  accountStatus: number;

  @Column({ type: "json", nullable: true })
  oaInfo: any;

  @Column({ default: 0 })
  user_mode: number;

  @Column({ nullable: true })
  globalId: string;

  @Column({ type: "json", nullable: true })
  bizPkg: any;

  @Column({ default: 0 })
  createdTs: number;

  @Column({ type: "json", nullable: true })
  oa_status: any;

  @ManyToOne(() => Account, (account) => account.friends)
  account: Account;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
