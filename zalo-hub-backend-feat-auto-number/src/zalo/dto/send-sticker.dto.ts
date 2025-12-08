import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class SendStickerDto {
  @ApiProperty({ description: 'Account ID' })
  @IsNumber()
  accountId: number;

  @ApiProperty({ description: 'Friend Zalo ID' })
  @IsString()
  friendZaloId: string;

  @ApiProperty({ description: 'Sticker ID' })
  @IsNumber()
  stickerId: number;

  @ApiProperty({ description: 'Category ID' })
  @IsNumber()
  cateId: number;

  @ApiProperty({ description: 'Sticker type' })
  @IsNumber()
  type: number;

  @ApiProperty({ description: 'Sticker URL' })
  @IsString()
  stickerUrl: string;

  @ApiProperty({ description: 'Sticker sprite URL' })
  @IsString()
  stickerSpriteUrl: string;

  @ApiProperty({ description: 'Sticker webp URL', required: false })
  @IsOptional()
  @IsString()
  stickerWebpUrl?: string;
}
