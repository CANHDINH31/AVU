import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountSettingsDto {
  @ApiProperty({
    description: 'Whether automatic friend request sending is enabled',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoFriendRequestEnabled?: boolean;

  @ApiProperty({
    description: 'Start time for automatic friend requests (HH:00 format)',
    required: false,
  })
  @IsOptional()
  @IsString()
  friendRequestStartTime?: string;

  @ApiProperty({
    description: 'Whether automatic message sending is enabled',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  autoMessageEnabled?: boolean;

  @ApiProperty({
    description: 'Bulk message content to send automatically',
    required: false,
  })
  @IsOptional()
  @IsString()
  bulkMessageContent?: string;
}
