import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsArray,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetPhoneNumbersDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Page size', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Account ID filter', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  accountId?: number;

  @ApiProperty({
    description: 'Filter by friend status',
    required: false,
    enum: [true, false],
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === true || value === 'true' || value === '1' || value === 1) {
      return true;
    }
    if (value === false || value === 'false' || value === '0' || value === 0) {
      return false;
    }
    return undefined;
  })
  isFriend?: boolean;

  @ApiProperty({
    description: 'Filter by friend request status',
    required: false,
    enum: [0, 1],
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  hasSentFriendRequest?: number;

  @ApiProperty({
    description: 'Filter by scan status',
    required: false,
    enum: ['scanned', 'notScanned'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['scanned', 'notScanned'])
  scannedStatus?: 'scanned' | 'notScanned';

  @ApiProperty({
    description: 'Filter last scanned from (ISO date string)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  scannedFrom?: string;

  @ApiProperty({
    description: 'Filter last scanned to (ISO date string)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  scannedTo?: string;

  @ApiProperty({
    description: 'Filter created from (ISO date string)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({
    description: 'Filter created to (ISO date string)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiProperty({
    description: 'Sort field',
    required: false,
    enum: ['lastScannedAt', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['lastScannedAt', 'createdAt'])
  sortBy?: 'lastScannedAt' | 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Minimum scan count filter',
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minScanCount?: number;

  @ApiProperty({
    description: 'Maximum scan count filter',
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxScanCount?: number;

  @ApiProperty({
    description: 'Filter by whether scan info exists',
    required: false,
    enum: [true, false],
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === true || value === 'true' || value === '1' || value === 1) {
      return true;
    }
    if (value === false || value === 'false' || value === '0' || value === 0) {
      return false;
    }
    return undefined;
  })
  hasScanInfo?: boolean;

  @ApiProperty({
    description: 'Filter by whether any message exists',
    required: false,
    enum: [true, false],
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === true || value === 'true' || value === '1' || value === 1) {
      return true;
    }
    if (value === false || value === 'false' || value === '0' || value === 0) {
      return false;
    }
    return undefined;
  })
  hasMessage?: boolean;

  @ApiProperty({
    description: 'Filter last message sent from (ISO date string)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  lastMessageFrom?: string;

  @ApiProperty({
    description: 'Filter last message sent to (ISO date string)',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsDateString()
  lastMessageTo?: string;

  @ApiProperty({
    description: 'Filter by last message status',
    required: false,
    enum: ['all', 'success', 'messageBlocked', 'strangerBlocked', 'noMsgId'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['all', 'success', 'messageBlocked', 'strangerBlocked', 'noMsgId'])
  lastMessageStatus?:
    | 'all'
    | 'success'
    | 'messageBlocked'
    | 'strangerBlocked'
    | 'noMsgId';
}

export class BulkDeleteDto {
  @ApiProperty({ description: 'Array of IDs to delete', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];
}

export class ScanPhoneNumbersDto {
  @ApiProperty({
    description: 'Array of phone number IDs to scan',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiProperty({
    description: 'Account ID to use for scanning',
    type: Number,
    example: 1,
  })
  @IsNumber()
  accountId: number;
}

export class SendBulkMessagesDto {
  @ApiProperty({
    description: 'Array of phone number IDs to send messages to',
    type: [Number],
    example: [1, 2, 3],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @ApiProperty({
    description: 'Account ID to use for sending messages',
    type: Number,
    example: 1,
  })
  @IsNumber()
  accountId: number;

  @ApiProperty({
    description: 'Message content to send',
    type: String,
    example: 'Xin chào!',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
