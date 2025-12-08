import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdateFriendDto {
  @ApiPropertyOptional({ description: 'Display name of the friend' })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({ description: 'Username of the friend' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Background avatar URL' })
  @IsOptional()
  @IsString()
  bgavatar?: string;

  @ApiPropertyOptional({ description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  cover?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Is friend status' })
  @IsOptional()
  @IsNumber()
  isFr?: number;

  @ApiPropertyOptional({ description: 'Is blocked status' })
  @IsOptional()
  @IsNumber()
  isBlocked?: number;

  @ApiPropertyOptional({ description: 'Is active status' })
  @IsOptional()
  @IsNumber()
  isActive?: number;
}
