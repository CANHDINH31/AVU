import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Account } from "./account.entity";

@Entity("friend_requests")
export class FriendRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accountId: number;

  @ManyToOne(() => Account, (account) => account.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "accountId" })
  account: Account;

  @Column()
  userId: string;

  @Column()
  zaloName: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  status: string;

  @Column({ nullable: true })
  gender: number;

  @Column({ nullable: true })
  dob: number;

  @Column({ nullable: true })
  type: number;

  @Column({ nullable: true })
  recommType: number;

  @Column({ nullable: true })
  recommSrc: number;

  @Column({ type: "decimal", precision: 20, scale: 0, nullable: true })
  recommTime: string | null; // dùng string vì JS không chính xác với số lớn > 2^53

  @Column({ nullable: true })
  recommInfo: string;

  @Column({ nullable: true })
  bizPkg: string;

  @Column({ default: 0 })
  isSeenFriendReq: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
