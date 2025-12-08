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

@Entity("sent_friend_requests")
export class SentFriendRequest {
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
  globalId: string;

  @Column({ nullable: true })
  bizPkg: string;

  @Column({ nullable: true })
  fReqInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
