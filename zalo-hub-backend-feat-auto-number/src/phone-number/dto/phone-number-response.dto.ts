import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumber } from '../entities/phone-number.entity';
import { PhoneNumberMessage } from '../entities/phone-number-message.entity';

export class PhoneNumberResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  hasSentFriendRequest: number;

  @ApiProperty({
    description: 'Whether this phone number is already a friend',
    default: false,
  })
  isFriend: boolean;

  @ApiProperty()
  messagesSent: number;

  @ApiProperty({ required: false })
  messageHistory?: PhoneNumberMessage[];

  @ApiProperty({ required: false })
  lastScannedAt?: Date;

  @ApiProperty({ required: false })
  scanCount?: number;

  @ApiProperty({ required: false })
  hasScanInfo?: boolean;

  @ApiProperty({ required: false })
  lastMessageContent?: string;

  @ApiProperty({ required: false })
  lastMessageAt?: Date;

  @ApiProperty({ required: false })
  lastMessageStatus?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromEntity(entity: PhoneNumber): PhoneNumberResponseDto {
    const dto = new PhoneNumberResponseDto();
    dto.id = entity.id;
    dto.phoneNumber = entity.phoneNumber;
    dto.name = entity.name;
    dto.avatar = entity.avatar;
    dto.notes = entity.notes;
    dto.hasSentFriendRequest = entity.hasSentFriendRequest;
    dto.isFriend = entity.isFriend || false;
    dto.messagesSent = entity.messagesSent;
    const sortedMessages = entity.messageHistory
      ? [...entity.messageHistory].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      : [];
    dto.messageHistory = sortedMessages;
    if (sortedMessages.length > 0) {
      const [latest] = sortedMessages;
      dto.lastMessageContent = latest.content;
      dto.lastMessageAt = latest.createdAt;
      dto.lastMessageStatus = latest.status;
    }
    dto.lastScannedAt = entity.lastScannedAt;
    dto.scanCount = entity.scanCount;
    dto.hasScanInfo = entity.hasScanInfo;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}

export class PhoneNumbersListResponseDto {
  @ApiProperty({ type: [PhoneNumberResponseDto] })
  data: PhoneNumberResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  totalPages: number;
}

export class BulkOperationResponseDto {
  @ApiProperty()
  success: number;

  @ApiProperty()
  failed: number;

  @ApiProperty({ type: [String], required: false })
  errors?: string[];
}

export class ImportExcelResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  batchesQueued: number;

  @ApiProperty()
  isProcessing: boolean;
}
