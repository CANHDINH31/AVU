import { ApiProperty } from '@nestjs/swagger';

export class SentFriendRequestResponseDto {
  @ApiProperty({ description: 'Friend request ID' })
  id: number;

  @ApiProperty({ description: 'Account ID (người gửi)' })
  accountId: number;

  @ApiProperty({ description: 'User ID (người nhận)' })
  userId: string;

  @ApiProperty({ description: 'Zalo name', required: false })
  zaloName?: string;

  @ApiProperty({ description: 'Display name', required: false })
  displayName?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatar?: string;

  @ApiProperty({ description: 'globalId', required: false })
  globalId?: string;

  @ApiProperty({ description: 'bizPkg', required: false })
  bizPkg?: string;

  @ApiProperty({ description: 'fReqInfo', required: false })
  fReqInfo?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class SentFriendRequestsListResponseDto {
  @ApiProperty({
    description: 'List of friends',
    type: [SentFriendRequestResponseDto],
  })
  data: SentFriendRequestResponseDto[];

  @ApiProperty({ description: 'Total number of friends' })
  total: number;
}
