import { ApiProperty } from '@nestjs/swagger';

export class FriendRequestResponseDto {
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

  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Status', required: false })
  status?: string;

  @ApiProperty({ description: 'Gender', required: false })
  gender?: number;

  @ApiProperty({ description: 'Date of birth timestamp', required: false })
  dob?: number;

  @ApiProperty({ description: 'Recommendation type', required: false })
  recommType?: number;

  @ApiProperty({ description: 'Recommendation source', required: false })
  recommSrc?: number;

  @ApiProperty({ description: 'Recommendation time', required: false })
  recommTime?: string; // dùng string vì JS không chính xác với số lớn > 2^53

  @ApiProperty({ description: 'Recommendation info', required: false })
  recommInfo?: string;

  @ApiProperty({ description: 'Business package', required: false })
  bizPkg?: string;

  @ApiProperty({ description: 'Has been seen', default: 0 })
  isSeenFriendReq: number;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class FriendRequestsListResponseDto {
  @ApiProperty({
    description: 'List of friends',
    type: [FriendRequestResponseDto],
  })
  data: FriendRequestResponseDto[];

  @ApiProperty({ description: 'Total number of friends' })
  total: number;
}
