import { ApiProperty } from '@nestjs/swagger';

export class FriendResponseDto {
  @ApiProperty({ description: 'Friend ID' })
  id: number;

  @ApiProperty({ description: 'Account ID' })
  accountId: number;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Username', required: false })
  username?: string;

  @ApiProperty({ description: 'Display name', required: false })
  displayName?: string;

  @ApiProperty({ description: 'Zalo name', required: false })
  zaloName?: string;

  @ApiProperty({ description: 'Avatar URL', required: false })
  avatar?: string;

  @ApiProperty({ description: 'Background avatar URL', required: false })
  bgavatar?: string;

  @ApiProperty({ description: 'Cover image URL', required: false })
  cover?: string;

  @ApiProperty({ description: 'Gender', required: false })
  gender?: number;

  @ApiProperty({ description: 'Date of birth timestamp', required: false })
  dob?: number;

  @ApiProperty({ description: 'String date of birth', required: false })
  sdob?: string;

  @ApiProperty({ description: 'Status', required: false })
  status?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ description: 'Is friend status' })
  isFr: number;

  @ApiProperty({ description: 'Is blocked status' })
  isBlocked: number;

  @ApiProperty({ description: 'Last action timestamp', required: false })
  lastActionTime?: number;

  @ApiProperty({ description: 'Last update timestamp', required: false })
  lastUpdateTime?: number;

  @ApiProperty({ description: 'Is active status' })
  isActive: number;

  @ApiProperty({ description: 'Friend key', required: false })
  friendKey?: number;

  @ApiProperty({ description: 'Type' })
  type: number;

  @ApiProperty({ description: 'Is active on PC' })
  isActivePC: number;

  @ApiProperty({ description: 'Is active on Web' })
  isActiveWeb: number;

  @ApiProperty({ description: 'Is valid' })
  isValid: number;

  @ApiProperty({ description: 'User key', required: false })
  userKey?: string;

  @ApiProperty({ description: 'Account status' })
  accountStatus: number;

  @ApiProperty({ description: 'OA information', required: false })
  oaInfo?: any;

  @ApiProperty({ description: 'User mode' })
  user_mode: number;

  @ApiProperty({ description: 'Global ID', required: false })
  globalId?: string;

  @ApiProperty({ description: 'Business package info', required: false })
  bizPkg?: any;

  @ApiProperty({ description: 'Created timestamp' })
  createdTs: number;

  @ApiProperty({ description: 'OA status', required: false })
  oa_status?: any;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class FriendsListResponseDto {
  @ApiProperty({ description: 'List of friends', type: [FriendResponseDto] })
  data: FriendResponseDto[];

  @ApiProperty({ description: 'Total number of friends' })
  total: number;
}
