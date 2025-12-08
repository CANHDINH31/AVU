import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('stickers')
export class Sticker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stickerId: number;

  @Column()
  cateId: number;

  @Column()
  type: number;

  @Column()
  stickerUrl: string;

  @Column()
  stickerSpriteUrl: string;

  @Column()
  totalFrames: number;

  @Column()
  duration: number;

  @Column({ nullable: true })
  stickerWebpUrl: string;
}
