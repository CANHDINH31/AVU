import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Friend } from "./friend.entity";
import { User } from "./user.entity";
import { FriendRequest } from "./friend-request.entity";
import { SentFriendRequest } from "./sent-friend-request.entity";

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  userZaloId: string;

  @Column({ nullable: true })
  accountStatus: number;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bgavatar: string;

  @Column("json", { nullable: true })
  bizPkg: { label: string | null; pkgId: number };

  @Column({ nullable: true })
  cover: string;

  @Column({ nullable: true })
  createdTs: number;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  dob: number;

  @Column({ nullable: true })
  gender: number;

  @Column({ nullable: true })
  globalId: string;

  @Column({ nullable: true })
  isActive: number;

  @Column({ nullable: true })
  isActivePC: number;

  @Column({ nullable: true })
  isActiveWeb: number;

  @Column({ nullable: true })
  isBlocked: number;

  @Column({ nullable: true })
  isFr: number;

  @Column({ nullable: true })
  isValid: number;

  @Column({ nullable: true, type: "int" })
  accountKey: number;

  @Column({ nullable: true })
  lastActionTime: number;

  @Column({ nullable: true })
  lastUpdateTime: number;

  @Column("json", { nullable: true })
  oaInfo: any;

  @Column("json", { nullable: true })
  oa_status: any;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  sdob: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  type: number;

  @Column({ nullable: true })
  userKey: string;

  @Column({ nullable: true })
  user_mode: number;

  @Column({ nullable: true })
  username: string;

  @Column({ nullable: true })
  zaloName: string;

  @Column({ default: 0 })
  isConnect: number;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: "SET NULL" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ nullable: true })
  imei: string;

  @Column({ type: "json", nullable: true })
  cookies: any;

  @Column({ nullable: true })
  userAgent: string;

  @OneToMany(() => Friend, (friend) => friend.account)
  friends: Friend[];

  @OneToMany(() => FriendRequest, (fr) => fr.account)
  friendRequests: FriendRequest[];

  @OneToMany(() => SentFriendRequest, (sfr) => sfr.account)
  sentFriendRequests: SentFriendRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
