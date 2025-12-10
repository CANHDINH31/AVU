import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, IsNull, Between, Brackets } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PhoneNumber } from './entities/phone-number.entity';
import { PhoneNumberMessage } from './entities/phone-number-message.entity';
import {
  DailyScanTracking,
  DailyScanPhoneDetail,
  FriendRequestDetail,
} from './entities/daily-scan-tracking.entity';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import { GetPhoneNumbersDto } from './dto/get-phone-numbers.dto';
import { ZaloService } from '../zalo/zalo.service';
import { Friend } from '../friend/entities/friend.entity';
import * as XLSX from 'xlsx';
import { Account } from '../account/entities/account.entity';

@Injectable()
export class PhoneNumberService {
  private readonly logger = new Logger(PhoneNumberService.name);

  constructor(
    @InjectRepository(PhoneNumber)
    private readonly phoneNumberRepository: Repository<PhoneNumber>,
    @InjectRepository(PhoneNumberMessage)
    private readonly phoneNumberMessageRepository: Repository<PhoneNumberMessage>,
    @InjectRepository(DailyScanTracking)
    private readonly dailyScanTrackingRepository: Repository<DailyScanTracking>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @Inject(forwardRef(() => ZaloService))
    private readonly zaloService: ZaloService,
    @InjectQueue('phone-number-scan')
    private readonly scanQueue: Queue,
  ) {}

  private static readonly DAILY_SCAN_LIMIT = 240;
  private static readonly AUTO_FRIEND_REQUEST_DAILY_LIMIT = 40;
  private static readonly FRIEND_DETAIL_MAX_ENTRIES = 200;
  private static readonly MAX_PENDING_FRIEND_REQUESTS = 500;
  private static readonly AUTO_FRIEND_REQUEST_SEND_BATCH = 40;
  private static readonly AUTO_FRIEND_REQUEST_CANCEL_BATCH = 50;
  private static readonly DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';
  private static readonly AUTO_MESSAGE_DAILY_LIMIT = 240;

  private formatDate(
    date: Date,
    timeZone: string = PhoneNumberService.DEFAULT_TIME_ZONE,
  ): string {
    // Chốt ngày theo múi giờ cấu hình để tránh lệch ngày (UTC vs local)
    const zoned = new Date(
      date.toLocaleString('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    );
    const year = zoned.getFullYear();
    const month = `${zoned.getMonth() + 1}`.padStart(2, '0');
    const day = `${zoned.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeDate(
    date: Date,
    timeZone: string = PhoneNumberService.DEFAULT_TIME_ZONE,
  ): Date {
    const dateStr = this.formatDate(date, timeZone);
    // Đặt mốc 00:00 tại đúng múi giờ cấu hình để tránh lệch cửa sổ ngày
    if (timeZone === 'Asia/Ho_Chi_Minh') {
      // UTC+7 cố định, không DST
      return new Date(`${dateStr}T00:00:00+07:00`);
    }
    // Fallback: dùng chuỗi có offset từ timeZone hiện tại của hệ thống
    return new Date(`${dateStr}T00:00:00`);
  }

  private convertToTimeZone(date: Date, timeZone: string): Date {
    const localeString = date.toLocaleString('en-US', {
      timeZone,
    });
    return new Date(localeString);
  }

  private hasReachedFriendRequestStartTime(
    startTime?: string | null,
    now: Date = new Date(),
  ): boolean {
    if (!startTime) {
      return false;
    }

    const [hourStr, minuteStr = '0'] = startTime
      .split(':')
      .map((v) => v.trim());
    const hour = Number(hourStr);
    const minute = Number(minuteStr);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return false;
    }

    const tzNow = this.convertToTimeZone(
      now,
      PhoneNumberService.DEFAULT_TIME_ZONE,
    );
    const target = new Date(tzNow);
    target.setHours(hour, minute, 0, 0);
    return tzNow.getTime() >= target.getTime();
  }

  async create(
    createDto: CreatePhoneNumberDto,
    userId: number,
  ): Promise<PhoneNumber> {
    // Check if phone number already exists with the same accountId
    const whereCondition: any = {
      phoneNumber: createDto.phoneNumber,
      accountId:
        createDto.accountId !== undefined && createDto.accountId !== null
          ? createDto.accountId
          : IsNull(),
    };

    const existing = await this.phoneNumberRepository.findOne({
      where: whereCondition,
    });

    if (existing) {
      throw new BadRequestException(
        'Số điện thoại đã tồn tại cho tài khoản này',
      );
    }

    const phoneNumber = this.phoneNumberRepository.create({
      ...createDto,
      userId,
    });

    return await this.phoneNumberRepository.save(phoneNumber);
  }

  /**
   * Build query builder with filters (shared logic for findAll and exportCsv)
   */
  private buildFilteredQueryBuilder(
    query: Omit<GetPhoneNumbersDto, 'page' | 'pageSize'>,
    userId?: number,
  ) {
    const {
      search,
      accountId,
      isFriend,
      hasSentFriendRequest,
      scannedStatus,
      scannedFrom,
      scannedTo,
      createdFrom,
      createdTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minScanCount,
      maxScanCount,
      hasScanInfo,
      hasMessage,
      lastMessageFrom,
      lastMessageTo,
      lastMessageStatus,
    } = query;

    // Normalize boolean filters: handle both boolean and string "true"/"false"
    const normalizeBoolean = (value: any): boolean | undefined => {
      if (value === undefined || value === null || value === '')
        return undefined;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') {
        const lower = value.toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
      }
      if (value === 1 || value === '1') return true;
      if (value === 0 || value === '0') return false;
      return undefined;
    };

    const normalizedHasScanInfo = normalizeBoolean(hasScanInfo);
    const normalizedIsFriend = normalizeBoolean(isFriend);
    const normalizedHasMessage = normalizeBoolean(hasMessage);

    // Validate accountId
    if (!accountId || Number.isNaN(Number(accountId))) {
      throw new BadRequestException('Vui lòng chọn tài khoản');
    }

    const validAccountId = Number(accountId);
    if (!Number.isInteger(validAccountId) || validAccountId <= 0) {
      throw new BadRequestException('Tài khoản không hợp lệ');
    }

    const queryBuilder = this.phoneNumberRepository
      .createQueryBuilder('phoneNumber')
      .leftJoinAndSelect('phoneNumber.messageHistory', 'messageHistory');

    // Filter by user if provided
    if (userId) {
      queryBuilder.where('phoneNumber.userId = :userId', { userId });
    }

    queryBuilder.andWhere('phoneNumber.accountId = :accountId', {
      accountId: validAccountId,
    });

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(phoneNumber.phoneNumber LIKE :search OR phoneNumber.name LIKE :search OR phoneNumber.notes LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (typeof normalizedIsFriend === 'boolean') {
      queryBuilder.andWhere('phoneNumber.isFriend = :isFriend', {
        isFriend: normalizedIsFriend,
      });
    }

    if (hasSentFriendRequest === 0 || hasSentFriendRequest === 1) {
      queryBuilder.andWhere(
        'phoneNumber.hasSentFriendRequest = :hasSentFriendRequest',
        { hasSentFriendRequest },
      );
    }

    if (scannedStatus === 'scanned') {
      queryBuilder.andWhere('phoneNumber.lastScannedAt IS NOT NULL');
    } else if (scannedStatus === 'notScanned') {
      queryBuilder.andWhere('phoneNumber.lastScannedAt IS NULL');
    }

    if (scannedFrom) {
      queryBuilder.andWhere('phoneNumber.lastScannedAt >= :scannedFrom', {
        scannedFrom,
      });
    }

    if (scannedTo) {
      queryBuilder.andWhere('phoneNumber.lastScannedAt <= :scannedTo', {
        scannedTo,
      });
    }

    if (createdFrom) {
      queryBuilder.andWhere('phoneNumber.createdAt >= :createdFrom', {
        createdFrom,
      });
    }

    if (createdTo) {
      queryBuilder.andWhere('phoneNumber.createdAt <= :createdTo', {
        createdTo,
      });
    }

    // Normalize minScanCount and maxScanCount
    let normalizedMinScanCount: number | undefined = undefined;
    if (minScanCount !== undefined && minScanCount !== null) {
      const parsed =
        typeof minScanCount === 'string' ? Number(minScanCount) : minScanCount;
      if (
        typeof parsed === 'number' &&
        !Number.isNaN(parsed) &&
        Number.isInteger(parsed)
      ) {
        normalizedMinScanCount = parsed;
      }
    }

    let normalizedMaxScanCount: number | undefined = undefined;
    if (maxScanCount !== undefined && maxScanCount !== null) {
      const parsed =
        typeof maxScanCount === 'string' ? Number(maxScanCount) : maxScanCount;
      if (
        typeof parsed === 'number' &&
        !Number.isNaN(parsed) &&
        Number.isInteger(parsed)
      ) {
        normalizedMaxScanCount = parsed;
      }
    }

    if (normalizedMinScanCount !== undefined) {
      queryBuilder.andWhere('phoneNumber.scanCount >= :minScanCount', {
        minScanCount: normalizedMinScanCount,
      });
    }

    if (normalizedMaxScanCount !== undefined) {
      queryBuilder.andWhere('phoneNumber.scanCount <= :maxScanCount', {
        maxScanCount: normalizedMaxScanCount,
      });
    }

    if (typeof normalizedHasScanInfo === 'boolean') {
      queryBuilder.andWhere('phoneNumber.hasScanInfo = :hasScanInfo', {
        hasScanInfo: normalizedHasScanInfo,
      });
    } else {
    }

    if (typeof normalizedHasMessage === 'boolean') {
      if (normalizedHasMessage) {
        queryBuilder.andWhere(
          'EXISTS (SELECT 1 FROM phone_number_messages msg WHERE msg.phoneNumberId = phoneNumber.id)',
        );
      } else {
        queryBuilder.andWhere(
          'NOT EXISTS (SELECT 1 FROM phone_number_messages msg WHERE msg.phoneNumberId = phoneNumber.id)',
        );
      }
    }

    if (lastMessageFrom) {
      queryBuilder.andWhere(
        '(SELECT MAX(msg.createdAt) FROM phone_number_messages msg WHERE msg.phoneNumberId = phoneNumber.id) >= :lastMessageFrom',
        { lastMessageFrom },
      );
    }

    if (lastMessageTo) {
      queryBuilder.andWhere(
        '(SELECT MAX(msg.createdAt) FROM phone_number_messages msg WHERE msg.phoneNumberId = phoneNumber.id) <= :lastMessageTo',
        { lastMessageTo },
      );
    }

    // Filter by last message status
    if (lastMessageStatus && lastMessageStatus !== 'all') {
      if (lastMessageStatus === 'success') {
        queryBuilder.andWhere(
          'phoneNumber.lastMessageSuccess = :lastMessageSuccess',
          {
            lastMessageSuccess: true,
          },
        );
      } else if (lastMessageStatus === 'messageBlocked') {
        queryBuilder.andWhere(
          'phoneNumber.hasMessageBlockedError = :hasMessageBlockedError',
          { hasMessageBlockedError: true },
        );
      } else if (lastMessageStatus === 'strangerBlocked') {
        queryBuilder.andWhere(
          'phoneNumber.hasStrangerBlockedError = :hasStrangerBlockedError',
          { hasStrangerBlockedError: true },
        );
      } else if (lastMessageStatus === 'noMsgId') {
        queryBuilder.andWhere(
          'phoneNumber.hasNoMsgIdError = :hasNoMsgIdError',
          {
            hasNoMsgIdError: true,
          },
        );
      }
    }

    const sortDirection = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sortBy === 'lastScannedAt') {
      queryBuilder.orderBy('phoneNumber.lastScannedAt', sortDirection);
    } else {
      queryBuilder.orderBy('phoneNumber.createdAt', sortDirection);
    }

    queryBuilder.addOrderBy('phoneNumber.id', 'ASC');

    // Debug: Log final SQL query
    const sql = queryBuilder.getSql();
    const params = queryBuilder.getParameters();

    return queryBuilder;
  }

  async findAll(
    query: GetPhoneNumbersDto,
    userId?: number,
  ): Promise<{
    data: PhoneNumber[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const { page = 1, pageSize = 20, accountId } = query;

    if (!accountId) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const skip = (page - 1) * pageSize;
    const queryBuilder = this.buildFilteredQueryBuilder(query, userId);

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findOne(id: number): Promise<PhoneNumber> {
    if (Number.isNaN(id) || !Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('ID không hợp lệ');
    }

    const phoneNumber = await this.phoneNumberRepository.findOne({
      where: { id },
      relations: ['messageHistory'],
    });

    if (!phoneNumber) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    return phoneNumber;
  }

  async update(
    id: number,
    updateDto: UpdatePhoneNumberDto,
  ): Promise<PhoneNumber> {
    const phoneNumber = await this.findOne(id);

    // Check if phone number or accountId is being changed and if it already exists
    const phoneNumberChanged =
      updateDto.phoneNumber &&
      updateDto.phoneNumber !== phoneNumber.phoneNumber;
    const accountIdChanged =
      updateDto.accountId !== undefined &&
      updateDto.accountId !== phoneNumber.accountId;

    if (phoneNumberChanged || accountIdChanged) {
      const checkPhoneNumber = updateDto.phoneNumber || phoneNumber.phoneNumber;
      const checkAccountId =
        updateDto.accountId !== undefined
          ? updateDto.accountId
          : phoneNumber.accountId;

      const whereCondition: any = {
        phoneNumber: checkPhoneNumber,
        accountId:
          checkAccountId !== undefined && checkAccountId !== null
            ? checkAccountId
            : IsNull(),
      };

      const existing = await this.phoneNumberRepository.findOne({
        where: whereCondition,
      });

      // If found existing and it's not the same record we're updating
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'Số điện thoại đã tồn tại cho tài khoản này',
        );
      }
    }

    Object.assign(phoneNumber, updateDto);
    return await this.phoneNumberRepository.save(phoneNumber);
  }

  async remove(id: number): Promise<void> {
    const phoneNumber = await this.findOne(id);
    await this.phoneNumberRepository.remove(phoneNumber);
  }

  async bulkDelete(ids: number[]): Promise<{
    success: number;
    failed: number;
    invalidIds: number[];
    errors: string[];
  }> {
    if (ids.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    // Validate all IDs
    const invalidIds: number[] = [];
    const validIds: number[] = [];

    ids.forEach((id) => {
      if (
        Number.isNaN(id) ||
        !Number.isInteger(id) ||
        id <= 0 ||
        id === null ||
        id === undefined
      ) {
        invalidIds.push(id);
      } else {
        validIds.push(id);
      }
    });

    const errors: string[] = [];
    if (invalidIds.length > 0) {
      errors.push(
        `Các ID không hợp lệ: ${invalidIds.join(', ')}. Chỉ chấp nhận số nguyên dương.`,
      );
    }

    let success = 0;
    let failed = 0;

    if (validIds.length > 0) {
      try {
        const result = await this.phoneNumberRepository.delete({
          id: In(validIds),
        });
        success = result.affected || 0;
        failed = validIds.length - success;
        if (failed > 0) {
          errors.push(
            `${failed} số điện thoại không tồn tại hoặc không thể xóa.`,
          );
        }
      } catch (error) {
        failed = validIds.length;
        errors.push(`Lỗi khi xóa: ${error.message || 'Không xác định'}`);
      }
    }

    return {
      success,
      failed: failed + invalidIds.length,
      invalidIds,
      errors,
    };
  }

  async importExcel(
    file: Express.Multer.File,
    userId: number,
    accountId?: number,
  ): Promise<{
    message: string;
    totalRows: number;
    batchesQueued: number;
    isProcessing: boolean;
  }> {
    if (!file) {
      throw new BadRequestException('File không hợp lệ');
    }

    if (!accountId) {
      throw new BadRequestException('Vui lòng chọn tài khoản để import');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON - only read column A
    const data = XLSX.utils.sheet_to_json<{ phoneNumber: any }>(worksheet, {
      header: ['phoneNumber'], // Only read first column
      range: 0, // Read from first row (A1)
      defval: null,
    });

    // Filter and normalize phone numbers
    const BATCH_SIZE = 100;
    const phoneNumbers: string[] = [];

    for (const row of data) {
      const phoneNumberStr = String(row.phoneNumber || '').trim();

      // Skip empty rows
      if (!phoneNumberStr) {
        continue;
      }

      // Validate phone number format (basic validation)
      const normalizedPhone = phoneNumberStr.replace(/^\+84/, '84');
      if (!/^[0-9]{10,11}$/.test(normalizedPhone)) {
        continue; // Skip invalid numbers, they'll be counted as failed in processing
      }

      phoneNumbers.push(normalizedPhone);
    }

    if (phoneNumbers.length === 0) {
      throw new BadRequestException('Không có số điện thoại hợp lệ trong file');
    }

    // Split into batches of 100
    const batches: string[][] = [];
    for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
      batches.push(phoneNumbers.slice(i, i + BATCH_SIZE));
    }

    // Add each batch to queue
    const now = new Date();
    const timestamp = now.getTime();
    let batchesQueued = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      try {
        await this.scanQueue.add(
          'import-phone-numbers-batch',
          {
            batch,
            accountId,
            userId,
            batchIndex: i,
            totalBatches: batches.length,
          },
          {
            jobId: `import-${accountId}-${timestamp}-${i}`,
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            timeout: 300000, // 5 minutes per batch
          },
        );
        batchesQueued++;
      } catch (error) {
        this.logger.error(
          `Không thể xếp lịch batch ${i + 1}/${batches.length} cho account ${accountId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Đã xếp lịch import ${phoneNumbers.length} số điện thoại thành ${batchesQueued} batch cho account ${accountId}`,
    );

    return {
      message: `Đã nhận ${phoneNumbers.length} số điện thoại. Dữ liệu đang được xử lý trong ${batchesQueued} batch. Vui lòng đợi trong giây lát.`,
      totalRows: phoneNumbers.length,
      batchesQueued,
      isProcessing: true,
    };
  }

  async exportExcel(): Promise<Buffer> {
    const phoneNumbers = await this.phoneNumberRepository.find({
      order: { createdAt: 'DESC' },
    });

    // Prepare data for Excel
    const excelData = phoneNumbers.map((pn) => ({
      'Số điện thoại': pn.phoneNumber,
      Tên: pn.name || '',
      'Ghi chú': pn.notes || '',
      'Đã gửi lời mời': pn.hasSentFriendRequest === 1 ? 'Có' : 'Không',
      'Số tin nhắn đã gửi': pn.messagesSent,
      'Ngày tạo': pn.createdAt.toLocaleDateString('vi-VN'),
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Số điện thoại');

    // Convert to buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    return excelBuffer;
  }

  /**
   * Format phone number: convert 0xxx to 84xxx format
   * Example: 0912345678 -> 84912345678
   */
  private formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    // If starts with 0, replace with 84
    if (digits.startsWith('0') && digits.length >= 10) {
      return '84' + digits.substring(1);
    }
    // If already starts with 84, return as is
    if (digits.startsWith('84')) {
      return digits;
    }
    // Otherwise return as is
    return digits;
  }

  /**
   * Export CSV with all data matching filters (no pagination)
   */
  async exportCsv(
    query: Omit<GetPhoneNumbersDto, 'page' | 'pageSize'>,
    userId?: number,
  ): Promise<string> {
    // Use the same filter logic as findAll to ensure consistency
    // Note: buildFilteredQueryBuilder already includes leftJoinAndSelect for messageHistory
    const queryBuilder = this.buildFilteredQueryBuilder(query, userId);

    // Get all data without pagination (but with all filters applied)
    const phoneNumbers = await queryBuilder.getMany();

    // Prepare CSV header
    const header = [
      'Số điện thoại',
      'Tên',
      'Ghi chú',
      'Là bạn bè',
      'Đã gửi lời mời',
      'Số lần quét',
      'Đã lấy thông tin',
      'Lần quét gần nhất',
      'Tin nhắn cuối',
      'Thời gian tin nhắn cuối',
    ];

    // Escape CSV value
    const escapeCsvValue = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) {
        return '""';
      }
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };

    // Prepare CSV rows
    const rows = phoneNumbers.map((phone) => {
      const formattedPhone = this.formatPhoneNumber(phone.phoneNumber);
      // Add padding to phone number and name columns to make them wider
      const phoneWithPadding = formattedPhone ? ` ${formattedPhone} ` : '';
      const nameWithPadding = phone.name ? ` ${phone.name} ` : ' ';

      // Get last message
      let lastMessageContent = '';
      let lastMessageTime = '';
      if (phone.messageHistory && phone.messageHistory.length > 0) {
        // Sort messages by createdAt descending to get the latest one
        const sortedMessages = [...phone.messageHistory].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        const lastMessage = sortedMessages[0];
        lastMessageContent = lastMessage.content || '';
        lastMessageTime = lastMessage.createdAt
          ? new Date(lastMessage.createdAt).toLocaleString('vi-VN')
          : '';
      }

      return [
        escapeCsvValue(phoneWithPadding),
        escapeCsvValue(nameWithPadding),
        escapeCsvValue(phone.notes || ''),
        escapeCsvValue(phone.isFriend ? 'Có' : 'Không'),
        escapeCsvValue(
          phone.hasSentFriendRequest === 1 ? 'Đã gửi' : 'Chưa gửi',
        ),
        escapeCsvValue(phone.scanCount ?? 0),
        escapeCsvValue(phone.hasScanInfo ? 'Đã có' : 'Chưa có'),
        escapeCsvValue(
          phone.lastScannedAt
            ? new Date(phone.lastScannedAt).toLocaleString('vi-VN')
            : '',
        ),
        escapeCsvValue(lastMessageContent),
        escapeCsvValue(lastMessageTime),
      ];
    });

    // Combine header and rows
    const csvHeader = header.join(',');
    const csvBody = rows.map((row) => row.join(',')).join('\n');
    const csvContent = [csvHeader, csvBody].filter(Boolean).join('\n');

    return csvContent;
  }

  async addMessage(
    phoneNumberId: number,
    content: string,
    accountId?: number,
    type?: string,
    status: string = 'sent',
    error?: string,
    mode: 'manual' | 'auto' = 'manual',
    responsePayload?: unknown,
    isSuccess?: boolean,
  ): Promise<PhoneNumberMessage | null> {
    // Nếu phoneNumber đã bị xoá hoặc không tồn tại, bỏ qua để tránh lỗi FK
    const phoneNumber = await this.phoneNumberRepository.findOne({
      where: { id: phoneNumberId },
    });
    if (!phoneNumber) {
      // eslint-disable-next-line no-console
      console.warn(
        `Bỏ qua lưu lịch sử tin nhắn vì phoneNumberId=${phoneNumberId} không tồn tại`,
      );
      return null;
    }

    const serializedResponse =
      responsePayload === undefined || responsePayload === null
        ? null
        : typeof responsePayload === 'string'
          ? responsePayload
          : JSON.stringify(responsePayload);

    // Nếu isSuccess được truyền vào thì dùng giá trị đó, nếu không thì tính từ status
    const finalIsSuccess =
      isSuccess !== undefined ? isSuccess : status === 'sent';

    const message = this.phoneNumberMessageRepository.create({
      phoneNumberId,
      content,
      accountId,
      type,
      mode,
      status,
      error,
      isSuccess: finalIsSuccess,
      responsePayload: serializedResponse,
    });

    const savedMessage = await this.phoneNumberMessageRepository.save(message);

    // Update messagesSent count only when message sent successfully
    if (status === 'sent') {
      phoneNumber.messagesSent = (phoneNumber.messagesSent || 0) + 1;
      await this.phoneNumberRepository.save(phoneNumber);
    }

    return savedMessage;
  }

  /**
   * Kiểm tra xem responsePayload có chứa msgId hợp lệ không
   * Tin nhắn chỉ được coi là thành công thực sự khi có msgId
   */
  private hasValidMsgId(responsePayload?: unknown): boolean {
    if (!responsePayload) {
      return false;
    }

    try {
      let parsed: any;
      if (typeof responsePayload === 'string') {
        parsed = JSON.parse(responsePayload);
      } else {
        parsed = responsePayload;
      }

      // Kiểm tra success: true và có msgId trong result.message.msgId
      if (
        parsed?.success === true &&
        parsed?.result?.message?.msgId &&
        typeof parsed.result.message.msgId === 'string' &&
        parsed.result.message.msgId.trim() !== ''
      ) {
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  private async logMessageHistory(
    phoneNumberId: number,
    content: string,
    accountId: number,
    status: 'sent' | 'failed',
    errorMessage?: string,
    mode: 'auto' | 'manual' = 'manual',
    responsePayload?: unknown,
  ): Promise<void> {
    try {
      // Store mode in type field for backward compatibility: 'text-auto' or 'text-manual'
      const type = `text-${mode}`;

      // Kiểm tra nếu status là 'sent' nhưng không có msgId hợp lệ trong responsePayload
      // thì coi như thất bại
      let finalStatus = status;
      let finalError = errorMessage;
      let finalIsSuccess = false; // Mặc định là false, chỉ set true khi có msgId hợp lệ

      if (status === 'sent') {
        if (responsePayload && this.hasValidMsgId(responsePayload)) {
          // Có responsePayload và có msgId hợp lệ -> thành công thực sự
          finalIsSuccess = true;
        } else if (responsePayload && !this.hasValidMsgId(responsePayload)) {
          // Có responsePayload nhưng không có msgId -> thực tế là thất bại
          finalStatus = 'failed';
          finalIsSuccess = false;
          finalError =
            'Zalo đã trả về success nhưng không có msgId. Tin nhắn có thể không được gửi thực sự.';
        }
        // Nếu status === 'sent' nhưng không có responsePayload, giữ finalIsSuccess = false
      } else {
        // status === 'failed'
        finalIsSuccess = false;
      }

      await this.addMessage(
        phoneNumberId,
        content,
        accountId,
        type,
        finalStatus,
        finalError,
        mode,
        responsePayload,
        finalIsSuccess,
      );

      // Cập nhật các trường đánh dấu trong PhoneNumber entity
      await this.updatePhoneNumberMessageFlags(
        phoneNumberId,
        finalIsSuccess,
        finalError,
      );
    } catch (logError) {
      // eslint-disable-next-line no-console
      console.warn(
        `Không thể lưu lịch sử tin nhắn cho phoneNumberId=${phoneNumberId}: ${logError.message}`,
      );
    }
  }

  /**
   * Cập nhật các trường đánh dấu trong PhoneNumber entity dựa trên kết quả gửi tin nhắn
   */
  private async updatePhoneNumberMessageFlags(
    phoneNumberId: number,
    isSuccess: boolean,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const phoneNumber = await this.phoneNumberRepository.findOne({
        where: { id: phoneNumberId },
      });

      if (!phoneNumber) {
        return;
      }

      // Always mark the latest message attempt time (success or failure)
      phoneNumber.lastMessageSentAt = new Date();

      // Cập nhật lastMessageSuccess
      phoneNumber.lastMessageSuccess = isSuccess;

      // Nếu gửi thành công, reset tất cả các cờ lỗi
      if (isSuccess) {
        phoneNumber.hasMessageBlockedError = false;
        phoneNumber.hasStrangerBlockedError = false;
        phoneNumber.hasNoMsgIdError = false;
      } else if (errorMessage) {
        // Nếu gửi thất bại, đánh dấu các lỗi cụ thể
        // Lỗi: "Không thể nhận tin nhắn từ bạn"
        if (
          errorMessage.includes('Không thể nhận tin nhắn từ bạn') ||
          errorMessage.includes(
            'Gửi tin nhắn thất bại: Không thể nhận tin nhắn từ bạn',
          )
        ) {
          phoneNumber.hasMessageBlockedError = true;
        }

        // Lỗi: "Bạn chưa thể gửi tin nhắn đến người này vì người này chặn không nhận tin nhắn từ người lạ"
        if (
          errorMessage.includes('chặn không nhận tin nhắn từ người lạ') ||
          errorMessage.includes(
            'Bạn chưa thể gửi tin nhắn đến người này vì người này chặn không nhận tin nhắn từ người lạ',
          )
        ) {
          phoneNumber.hasStrangerBlockedError = true;
        }

        // Lỗi: "Zalo đã trả về success nhưng không có msgId"
        if (
          errorMessage.includes('không có msgId') ||
          errorMessage.includes(
            'Zalo đã trả về success nhưng không có msgId. Tin nhắn có thể không được gửi thực sự.',
          )
        ) {
          phoneNumber.hasNoMsgIdError = true;
        }
      }

      await this.phoneNumberRepository.save(phoneNumber);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(
        `Không thể cập nhật cờ tin nhắn cho phoneNumberId=${phoneNumberId}: ${error.message}`,
      );
    }
  }

  async markFriendRequestSent(phoneNumberId: number): Promise<PhoneNumber> {
    const phoneNumber = await this.findOne(phoneNumberId);
    phoneNumber.hasSentFriendRequest = 1;
    return await this.phoneNumberRepository.save(phoneNumber);
  }

  /**
   * Get or create daily scan tracking for a specific account (one record per account)
   */
  private async getOrCreateDailyTracking(
    accountId: number,
    date: Date = new Date(),
  ): Promise<DailyScanTracking> {
    const normalizedDate = this.normalizeDate(date);
    const trackingDateStr = this.formatDate(normalizedDate);

    // Always try to read first
    let tracking = await this.dailyScanTrackingRepository
      .createQueryBuilder('tracking')
      .where('tracking.accountId = :accountId', { accountId })
      .andWhere('tracking.trackingDate = :trackingDate', {
        trackingDate: trackingDateStr,
      })
      .getOne();

    if (!tracking) {
      const account = await this.accountRepository.findOne({
        where: { id: accountId },
      });

      const baseData = {
        accountId,
        trackingDate: trackingDateStr, // store as date string to avoid TZ drift
        lastScanDate: trackingDateStr,
        dailyScanCount: 0,
        scanEnabled: account?.scanEnabled ?? false,
        totalScanned: 0,
        withInfo: 0,
        withoutInfo: 0,
        withInfoDetails: [],
        withoutInfoDetails: [],
        manualScanCount: 0,
        manualWithInfoDetails: [],
        manualWithoutInfoDetails: [],
        autoFriendRequestsSentToday: 0,
        autoFriendRequestsCanceledToday: 0,
        autoFriendRequestsSentTotal: 0,
        autoFriendRequestsCanceledTotal: 0,
        autoFriendRequestDetails: [],
        autoFriendCancelDetails: [],
        manualFriendRequestsSentToday: 0,
        manualFriendRequestsCanceledToday: 0,
        manualFriendRequestsSentTotal: 0,
        manualFriendRequestsCanceledTotal: 0,
        manualFriendRequestDetails: [],
        manualFriendCancelDetails: [],
        autoFriendRequestDailyLimit:
          PhoneNumberService.AUTO_FRIEND_REQUEST_DAILY_LIMIT,
        manualMessageToday: 0,
        autoMessageToday: 0,
        limitAutoMessageToday: PhoneNumberService.AUTO_MESSAGE_DAILY_LIMIT,
      };

      try {
        // Atomic upsert to avoid duplicate rows on concurrent calls
        await this.dailyScanTrackingRepository.upsert(baseData as any, [
          'accountId',
          'trackingDate',
        ]);
      } catch (error) {
        this.logger.warn(
          `Upsert daily_scan_tracking accountId=${accountId} date=${trackingDateStr} thất bại: ${
            (error as any)?.message || error
          }`,
        );
      }

      tracking = await this.dailyScanTrackingRepository
        .createQueryBuilder('tracking')
        .where('tracking.accountId = :accountId', { accountId })
        .andWhere('tracking.trackingDate = :trackingDate', {
          trackingDate: trackingDateStr,
        })
        .getOne();
    }

    if (!tracking) {
      throw new Error('Unable to create daily tracking record');
    }

    tracking.withInfoDetails = tracking.withInfoDetails || [];
    tracking.withoutInfoDetails = tracking.withoutInfoDetails || [];
    tracking.manualWithInfoDetails = tracking.manualWithInfoDetails || [];
    tracking.manualWithoutInfoDetails = tracking.manualWithoutInfoDetails || [];
    tracking.autoFriendRequestDetails = tracking.autoFriendRequestDetails || [];
    tracking.autoFriendCancelDetails = tracking.autoFriendCancelDetails || [];
    tracking.manualFriendRequestDetails =
      tracking.manualFriendRequestDetails || [];
    tracking.manualFriendCancelDetails =
      tracking.manualFriendCancelDetails || [];
    if (
      tracking.autoFriendRequestDailyLimit === null ||
      tracking.autoFriendRequestDailyLimit === undefined
    ) {
      tracking.autoFriendRequestDailyLimit =
        PhoneNumberService.AUTO_FRIEND_REQUEST_DAILY_LIMIT;
    }
    if (
      tracking.limitAutoMessageToday === null ||
      tracking.limitAutoMessageToday === undefined
    ) {
      tracking.limitAutoMessageToday =
        PhoneNumberService.AUTO_MESSAGE_DAILY_LIMIT;
    }
    return tracking;
  }

  /**
   * Enable or disable automatic daily scanning for an account
   */
  async updateDailyScanStatus(
    accountId: number,
    enabled: boolean,
  ): Promise<{ message: string; scanEnabled: boolean }> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const tracking = await this.getOrCreateDailyTracking(accountId, new Date());

    tracking.scanEnabled = enabled;
    account.scanEnabled = enabled;

    await this.accountRepository.save(account);
    await this.dailyScanTrackingRepository.save(tracking);

    return {
      message: enabled
        ? 'Đã bật chế độ quét tự động cho tài khoản'
        : 'Đã tắt chế độ quét tự động cho tài khoản',
      scanEnabled: tracking.scanEnabled,
    };
  }

  /**
   * Check if daily scan limit has been reached (based on today's details)
   */
  async checkDailyScanLimit(
    accountId: number,
    requestedCount: number = 1,
    date: Date = new Date(),
  ): Promise<{
    canScan: boolean;
    currentCount: number;
    maxAllowed: number;
    remaining: number;
  }> {
    const tracking = await this.getOrCreateDailyTracking(accountId, date);

    const maxAllowed = PhoneNumberService.DAILY_SCAN_LIMIT;
    const currentCount = tracking.dailyScanCount;
    const remaining = Math.max(0, maxAllowed - currentCount);
    const canScan = currentCount + requestedCount <= maxAllowed;

    return {
      canScan,
      currentCount,
      maxAllowed,
      remaining,
    };
  }

  private async recordFriendRequestAction(
    accountId: number,
    phoneNumber: PhoneNumber,
    action: 'send' | 'cancel',
    mode: 'auto' | 'manual',
    tracking?: DailyScanTracking,
  ): Promise<DailyScanTracking> {
    const record =
      tracking ?? (await this.getOrCreateDailyTracking(accountId, new Date()));

    const detail: FriendRequestDetail = {
      phoneNumberId: phoneNumber.id,
      phoneNumberStr: phoneNumber.phoneNumber,
      actionAt: new Date(),
    };

    const addDetail = (list?: FriendRequestDetail[]): FriendRequestDetail[] => {
      const next = [detail, ...(list || [])];
      return next.slice(0, PhoneNumberService.FRIEND_DETAIL_MAX_ENTRIES);
    };

    if (mode === 'auto') {
      if (action === 'send') {
        record.autoFriendRequestsSentToday =
          (record.autoFriendRequestsSentToday || 0) + 1;
        record.autoFriendRequestsSentTotal =
          (record.autoFriendRequestsSentTotal || 0) + 1;
        record.autoFriendRequestDetails = addDetail(
          record.autoFriendRequestDetails,
        );
      } else {
        record.autoFriendRequestsCanceledToday =
          (record.autoFriendRequestsCanceledToday || 0) + 1;
        record.autoFriendRequestsCanceledTotal =
          (record.autoFriendRequestsCanceledTotal || 0) + 1;
        record.autoFriendCancelDetails = addDetail(
          record.autoFriendCancelDetails,
        );
      }
    } else {
      if (action === 'send') {
        record.manualFriendRequestsSentToday =
          (record.manualFriendRequestsSentToday || 0) + 1;
        record.manualFriendRequestsSentTotal =
          (record.manualFriendRequestsSentTotal || 0) + 1;
        record.manualFriendRequestDetails = addDetail(
          record.manualFriendRequestDetails,
        );
      } else {
        record.manualFriendRequestsCanceledToday =
          (record.manualFriendRequestsCanceledToday || 0) + 1;
        record.manualFriendRequestsCanceledTotal =
          (record.manualFriendRequestsCanceledTotal || 0) + 1;
        record.manualFriendCancelDetails = addDetail(
          record.manualFriendCancelDetails,
        );
      }
    }

    await this.dailyScanTrackingRepository.save(record);
    return record;
  }

  /**
   * Record a scan in daily tracking (creates a new detail record for each day)
   */
  async recordScan(
    accountId: number,
    phoneNumberId: number,
    phoneNumberStr: string,
    hasInfo: boolean,
    options?: {
      date?: Date;
      mode?: 'auto' | 'manual';
    },
  ): Promise<void> {
    const { date = new Date(), mode = 'auto' } = options ?? {};
    const tracking = await this.getOrCreateDailyTracking(accountId, date);
    const isManual = mode === 'manual';

    const detail: DailyScanPhoneDetail = {
      phoneNumberId,
      phoneNumberStr,
      scannedAt: new Date(),
    };

    tracking.totalScanned += 1;
    if (hasInfo) {
      tracking.withInfo += 1;
    } else {
      tracking.withoutInfo += 1;
    }

    const targetList = (() => {
      if (isManual) {
        return hasInfo
          ? (tracking.manualWithInfoDetails ||= [])
          : (tracking.manualWithoutInfoDetails ||= []);
      }
      return hasInfo
        ? (tracking.withInfoDetails ||= [])
        : (tracking.withoutInfoDetails ||= []);
    })();

    const otherList = (() => {
      if (isManual) {
        return hasInfo
          ? (tracking.manualWithoutInfoDetails ||= [])
          : (tracking.manualWithInfoDetails ||= []);
      }
      return hasInfo
        ? (tracking.withoutInfoDetails ||= [])
        : (tracking.withInfoDetails ||= []);
    })();

    const existingIndex = targetList.findIndex(
      (item) => item.phoneNumberId === phoneNumberId,
    );
    const existingOtherIndex = otherList.findIndex(
      (item) => item.phoneNumberId === phoneNumberId,
    );

    if (existingOtherIndex !== -1) {
      otherList.splice(existingOtherIndex, 1);
    }

    if (existingIndex !== -1) {
      targetList[existingIndex] = detail;
    } else {
      targetList.unshift(detail);
    }

    if (existingIndex === -1 && existingOtherIndex === -1) {
      if (isManual) {
        tracking.manualScanCount = (tracking.manualScanCount || 0) + 1;
      } else {
        tracking.dailyScanCount += 1;
      }
    }

    await this.dailyScanTrackingRepository.save(tracking);
  }

  async getDailyStatistics(accountId: number, date?: string): Promise<any> {
    const scanDate = date
      ? new Date(date)
      : new Date(new Date().toISOString().split('T')[0]);
    const dateStr = scanDate.toISOString().split('T')[0];

    const tracking = await this.getOrCreateDailyTracking(accountId, scanDate);

    const maxScansPerDay = PhoneNumberService.DAILY_SCAN_LIMIT;
    const remaining = Math.max(0, maxScansPerDay - tracking.dailyScanCount);

    return {
      date: dateStr,
      totalScanned: tracking.totalScanned,
      withInfo: tracking.withInfo,
      withoutInfo: tracking.withoutInfo,
      dailyScanCount: tracking.dailyScanCount,
      manualScanCount: tracking.manualScanCount ?? 0,
      maxScansPerDay,
      remaining,
      scanEnabled: tracking.scanEnabled,
      withInfoDetails: tracking.withInfoDetails,
      withoutInfoDetails: tracking.withoutInfoDetails,
      manualWithInfoDetails: tracking.manualWithInfoDetails || [],
      manualWithoutInfoDetails: tracking.manualWithoutInfoDetails || [],
      autoFriendRequestsSentToday: tracking.autoFriendRequestsSentToday || 0,
      autoFriendRequestsCanceledToday:
        tracking.autoFriendRequestsCanceledToday || 0,
      autoFriendRequestsSentTotal: tracking.autoFriendRequestsSentTotal || 0,
      autoFriendRequestsCanceledTotal:
        tracking.autoFriendRequestsCanceledTotal || 0,
      manualFriendRequestsSentToday:
        tracking.manualFriendRequestsSentToday || 0,
      manualFriendRequestsCanceledToday:
        tracking.manualFriendRequestsCanceledToday || 0,
      manualFriendRequestsSentTotal:
        tracking.manualFriendRequestsSentTotal || 0,
      manualFriendRequestsCanceledTotal:
        tracking.manualFriendRequestsCanceledTotal || 0,
      autoFriendRequestDetails: tracking.autoFriendRequestDetails || [],
      autoFriendCancelDetails: tracking.autoFriendCancelDetails || [],
      manualFriendRequestDetails: tracking.manualFriendRequestDetails || [],
      manualFriendCancelDetails: tracking.manualFriendCancelDetails || [],
      autoFriendRequestDailyLimit:
        tracking.autoFriendRequestDailyLimit ||
        PhoneNumberService.AUTO_FRIEND_REQUEST_DAILY_LIMIT,
      manualMessageToday: tracking.manualMessageToday || 0,
      autoMessageToday: tracking.autoMessageToday || 0,
      limitAutoMessageToday:
        tracking.limitAutoMessageToday ||
        PhoneNumberService.AUTO_MESSAGE_DAILY_LIMIT,
    };
  }

  async scanPhoneNumbers(
    phoneNumberIds: number[],
    accountId: number,
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    // Validate all IDs
    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const phoneNumber of phoneNumbers) {
      await this.phoneNumberRepository.increment(
        { id: phoneNumber.id },
        'scanCount',
        1,
      );
      phoneNumber.scanCount = (phoneNumber.scanCount || 0) + 1;
      try {
        const result = await this.zaloService.scanPhoneNumber(
          accountId,
          phoneNumber.phoneNumber,
        );

        if (result) {
          // Update phone number with all scanned information
          phoneNumber.name =
            result.display_name || result.zalo_name || phoneNumber.name;
          phoneNumber.avatar = result.avatar || phoneNumber.avatar;
          phoneNumber.cover = result.cover || phoneNumber.cover;
          phoneNumber.status = result.status || phoneNumber.status;
          phoneNumber.gender =
            result.gender !== undefined ? result.gender : phoneNumber.gender;
          phoneNumber.dob = result.dob || phoneNumber.dob;
          phoneNumber.sdob = result.sdob || phoneNumber.sdob;
          phoneNumber.globalId = result.globalId || phoneNumber.globalId;
          phoneNumber.bizPkg = result.bizPkg
            ? JSON.stringify(result.bizPkg)
            : phoneNumber.bizPkg;
          phoneNumber.uid = result.uid || phoneNumber.uid;
          phoneNumber.zaloName = result.zalo_name || phoneNumber.zaloName;
          phoneNumber.displayName =
            result.display_name || phoneNumber.displayName;
          phoneNumber.lastScannedAt = new Date();
          phoneNumber.hasScanInfo = true;

          await this.phoneNumberRepository.save(phoneNumber);

          // Record scan in daily tracking
          await this.recordScan(
            accountId,
            phoneNumber.id,
            phoneNumber.phoneNumber,
            true,
            { mode: 'manual' },
          );

          success++;
        } else {
          failed++;
          errors.push(
            `Không tìm thấy thông tin cho số ${phoneNumber.phoneNumber}`,
          );
          phoneNumber.hasScanInfo = false;
          phoneNumber.lastScannedAt = new Date();
          await this.phoneNumberRepository.save(phoneNumber);

          // Record scan in daily tracking (without info)
          await this.recordScan(
            accountId,
            phoneNumber.id,
            phoneNumber.phoneNumber,
            false,
            { mode: 'manual' },
          );
        }
      } catch (error) {
        failed++;
        errors.push(
          `Lỗi khi quét ${phoneNumber.phoneNumber}: ${error.message}`,
        );
        phoneNumber.hasScanInfo = false;
        phoneNumber.lastScannedAt = new Date();
        await this.phoneNumberRepository.save(phoneNumber);

        // Record scan in daily tracking (without info)
        await this.recordScan(
          accountId,
          phoneNumber.id,
          phoneNumber.phoneNumber,
          false,
          { mode: 'manual' },
        );
      }
    }

    return { success, failed, errors: errors.slice(0, 50) };
  }

  async scanPhoneNumbersWithQueue(
    phoneNumberIds: number[],
    accountId: number,
  ): Promise<{
    message: string;
    totalJobs: number;
    batches: number;
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    // Validate all IDs
    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    // Clear queue before adding new jobs
    await this.scanQueue.empty();

    // Check daily scan limit
    const limitCheck = await this.checkDailyScanLimit(accountId, 0);
    const remaining = limitCheck.remaining;

    if (remaining <= 0) {
      throw new BadRequestException(
        `Đã đạt giới hạn quét trong ngày. Đã quét ${limitCheck.currentCount}/${limitCheck.maxAllowed} số. Vui lòng chờ đến ngày mai.`,
      );
    }

    // New policy: 40 numbers per batch, max 7 batches per day (280 numbers total)
    // Each batch is scheduled 1 hour apart
    const BATCH_SIZE = 40;
    const MAX_BATCHES_PER_DAY = 7;
    const DELAY_BETWEEN_BATCHES_MS = 3600000; // 1 hour in milliseconds

    // Limit the number of phone numbers to remaining quota
    const numbersToScan = Math.min(phoneNumbers.length, remaining);
    const limitedPhoneNumbers = phoneNumbers.slice(0, numbersToScan);

    // Split into batches of 40
    const batches: Array<{
      phoneNumberId: number;
      phoneNumber: string;
    }>[] = [];
    for (let i = 0; i < limitedPhoneNumbers.length; i += BATCH_SIZE) {
      batches.push(
        limitedPhoneNumbers.slice(i, i + BATCH_SIZE).map((p) => ({
          phoneNumberId: p.id!,
          phoneNumber: p.phoneNumber,
        })),
      );
    }

    // Limit batches to max 7 per day
    const batchesToSchedule = batches.slice(0, MAX_BATCHES_PER_DAY);

    // Add jobs to queue - each job contains a batch of 40 phone numbers
    // Schedule each batch 1 hour apart
    let totalJobs = 0;
    for (let i = 0; i < batchesToSchedule.length; i++) {
      const batch = batchesToSchedule[i];
      const delay = i * DELAY_BETWEEN_BATCHES_MS; // First batch starts immediately, next batches delayed

      await this.scanQueue.add(
        'scan-batch',
        {
          batch,
          accountId,
        },
        {
          delay, // Schedule job to start after delay
          attempts: 3,
          timeout: 600000, // 10 minutes timeout per batch
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      totalJobs++;
    }

    const totalScheduled = batchesToSchedule.reduce(
      (sum, batch) => sum + batch.length,
      0,
    );

    return {
      message: `Đã thêm ${batchesToSchedule.length} batch (${totalScheduled} số điện thoại) vào queue để quét. Mỗi batch 40 số, cách nhau 1 giờ. Tổng cộng sẽ quét trong ${batchesToSchedule.length} giờ.`,
      totalJobs: totalScheduled,
      batches: batchesToSchedule.length,
    };
  }

  @Cron('5 8-12 * * *', {
    name: 'daily-phone-number-scan',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async scanAllPhoneNumbersWithQueue(): Promise<{
    message: string;
    totalJobs: number;
    batches: number;
    accountsProcessed: number;
  }> {
    this.logger.log('Bắt đầu quét số điện thoại tự động (cronjob)');
    const activeAccounts = await this.accountRepository.find({
      where: { scanEnabled: true },
      select: ['id'],
    });

    if (activeAccounts.length === 0) {
      return {
        message: 'Không có tài khoản nào bật quét tự động',
        totalJobs: 0,
        batches: 0,
        accountsProcessed: 0,
      };
    }

    const BATCH_SIZE = 30;
    let totalJobs = 0;
    let totalBatches = 0;
    let accountsProcessed = 0;

    console.log('activeAccounts', activeAccounts?.length);

    for (const account of activeAccounts) {
      const tracking = await this.getOrCreateDailyTracking(
        account.id,
        new Date(),
      );

      if (!tracking.scanEnabled) {
        continue;
      }

      const remainingQuota = Math.min(
        PhoneNumberService.DAILY_SCAN_LIMIT - tracking.dailyScanCount,
        BATCH_SIZE,
      );

      if (remainingQuota <= 0) {
        continue;
      }

      const phoneNumbers = await this.phoneNumberRepository
        .createQueryBuilder('phoneNumber')
        .where('phoneNumber.accountId = :accountId', {
          accountId: account.id,
        })
        .andWhere(
          '(phoneNumber.hasScanInfo = false OR phoneNumber.hasScanInfo IS NULL)',
        )
        .orderBy('phoneNumber.scanCount', 'ASC')
        .addOrderBy('phoneNumber.lastScannedAt IS NULL', 'DESC')
        .addOrderBy('phoneNumber.lastScannedAt', 'ASC')
        .addOrderBy('phoneNumber.id', 'ASC')
        .limit(remainingQuota)
        .getMany();

      if (phoneNumbers.length === 0) {
        continue;
      }

      const batch = phoneNumbers.map((p) => ({
        phoneNumberId: p.id!,
        phoneNumber: p.phoneNumber,
      }));

      await this.scanQueue.add(
        'scan-batch',
        {
          batch,
          accountId: tracking.accountId,
        },
        {
          attempts: 3,
          timeout: 600000,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      totalJobs += batch.length;
      totalBatches++;
      accountsProcessed++;
    }

    const result = {
      message: `Đã thêm ${totalJobs} số điện thoại (mỗi batch tối đa ${BATCH_SIZE} số) vào queue để quét cho ${accountsProcessed} tài khoản.`,
      totalJobs,
      batches: totalBatches,
      accountsProcessed,
    };

    this.logger.log(`Hoàn thành quét số điện thoại tự động: ${result.message}`);

    return result;
  }

  async syncFriends(
    accountId: number,
    userId?: number,
  ): Promise<{
    message: string;
    totalFriends: number;
  }> {
    // Sync friends using ZaloService
    const result = await this.zaloService.syncFriends(accountId, userId || 0);

    return {
      message: `Đã đồng bộ ${result.totalFriends} bạn bè`,
      totalFriends: result.totalFriends,
    };
  }

  async autoSendFriendRequestsForAllAccounts(): Promise<{
    message: string;
    accountsProcessed: number;
    accountsSkipped: number;
    friendRequestsSent: number;
    friendRequestsCanceled: number;
    errors: string[];
  }> {
    const accounts = await this.accountRepository.find({
      where: { autoFriendRequestEnabled: true },
    });

    if (accounts.length === 0) {
      return {
        message: 'Không có tài khoản nào bật gửi lời mời kết bạn tự động',
        accountsProcessed: 0,
        accountsSkipped: 0,
        friendRequestsSent: 0,
        friendRequestsCanceled: 0,
        errors: [],
      };
    }

    const summary = {
      message: '',
      accountsProcessed: 0,
      accountsSkipped: 0,
      friendRequestsSent: 0,
      friendRequestsCanceled: 0,
      errors: [] as string[],
    };

    for (const account of accounts) {
      if (!account.autoFriendRequestEnabled) {
        summary.accountsSkipped++;
        continue;
      }

      if (
        !this.hasReachedFriendRequestStartTime(account.friendRequestStartTime)
      ) {
        summary.accountsSkipped++;
        continue;
      }

      try {
        await this.syncFriends(account.id, account.userId ?? 0);
        await this.checkAndUpdateFriendStatus(account.id);
      } catch (error) {
        const errorMessage = `Account ${account.id}: Không thể đồng bộ bạn bè - ${error?.message || 'Không xác định'}`;
        this.logger.error(errorMessage);
        summary.errors.push(errorMessage);
        summary.accountsSkipped++;
        continue;
      }

      if (
        (account.pendingFriendRequests || 0) >=
        PhoneNumberService.MAX_PENDING_FRIEND_REQUESTS
      ) {
        try {
          const pendingList = await this.phoneNumberRepository
            .createQueryBuilder('phoneNumber')
            .where('phoneNumber.accountId = :accountId', {
              accountId: account.id,
            })
            .andWhere('phoneNumber.hasSentFriendRequest = 1')
            .andWhere(
              '(phoneNumber.isFriend = false OR phoneNumber.isFriend IS NULL)',
            )
            .orderBy('phoneNumber.lastFriendRequestSentAt', 'ASC')
            .addOrderBy('phoneNumber.id', 'ASC')
            .limit(PhoneNumberService.AUTO_FRIEND_REQUEST_CANCEL_BATCH)
            .getMany();

          if (pendingList.length > 0) {
            const undoResult = await this.undoFriendRequests(
              pendingList.map((p) => p.id),
              account.id,
              account.userId ?? 0,
              { mode: 'auto' },
            );
            summary.friendRequestsCanceled += undoResult.success;
            account.pendingFriendRequests = Math.max(
              0,
              (account.pendingFriendRequests || 0) - undoResult.success,
            );
          }
        } catch (error) {
          const errorMessage = `Account ${account.id}: Không thể thu hồi lời mời kết bạn - ${error?.message || 'Không xác định'}`;
          this.logger.error(errorMessage);
          summary.errors.push(errorMessage);
          summary.accountsSkipped++;
          continue;
        }
      }

      try {
        const candidates = await this.phoneNumberRepository
          .createQueryBuilder('phoneNumber')
          .where('phoneNumber.accountId = :accountId', {
            accountId: account.id,
          })
          .andWhere(
            '(phoneNumber.hasSentFriendRequest = 0 OR phoneNumber.hasSentFriendRequest IS NULL)',
          )
          .andWhere('phoneNumber.hasScanInfo = true')
          .andWhere(
            '(phoneNumber.isFriend = false OR phoneNumber.isFriend IS NULL)',
          )
          .andWhere('phoneNumber.uid IS NOT NULL')
          .orderBy('phoneNumber.lastScannedAt', 'ASC')
          .addOrderBy('phoneNumber.id', 'ASC')
          .limit(PhoneNumberService.AUTO_FRIEND_REQUEST_SEND_BATCH)
          .getMany();

        if (candidates.length > 0) {
          const sendResult = await this.sendFriendRequests(
            candidates.map((p) => p.id),
            account.id,
            { mode: 'auto' },
          );
          summary.friendRequestsSent += sendResult.success;
        }
      } catch (error) {
        const errorMessage = `Account ${account.id}: Không thể gửi lời mời kết bạn - ${error?.message || 'Không xác định'}`;
        this.logger.error(errorMessage);
        summary.errors.push(errorMessage);
        summary.accountsSkipped++;
        continue;
      }

      summary.accountsProcessed++;
    }

    summary.message = `Đã xử lý ${summary.accountsProcessed}/${accounts.length} tài khoản gửi lời mời tự động`;
    return summary;
  }

  async autoSendBulkMessagesForEligibleAccounts(): Promise<{
    message: string;
    accountsProcessed: number;
    accountsQueued: number;
    accountsSkipped: number;
    batchesQueued: number;
    errors: string[];
  }> {
    const accounts = await this.accountRepository.find({
      where: { autoMessageEnabled: true },
    });

    if (accounts.length === 0) {
      return {
        message: 'Không có tài khoản nào bật gửi tin nhắn tự động',
        accountsProcessed: 0,
        accountsQueued: 0,
        accountsSkipped: 0,
        batchesQueued: 0,
        errors: [],
      };
    }

    const summary = {
      message: '',
      accountsProcessed: 0,
      accountsQueued: 0,
      accountsSkipped: 0,
      batchesQueued: 0,
      errors: [] as string[],
    };

    for (const account of accounts) {
      summary.accountsProcessed++;

      const messageContent = (account.bulkMessageContent || '').trim();
      if (!messageContent) {
        summary.accountsSkipped++;
        continue;
      }

      // Use the same date instance to ensure consistency across all date operations
      const now = new Date();
      const todayStart = this.normalizeDate(now);

      try {
        // Check daily auto message limit before queuing
        // getOrCreateDailyTracking will normalize the date internally,
        // but using the same 'now' instance ensures consistency
        const tracking = await this.getOrCreateDailyTracking(account.id, now);
        const autoCount = tracking.autoMessageToday || 0;
        const autoLimit =
          tracking.limitAutoMessageToday ??
          PhoneNumberService.AUTO_MESSAGE_DAILY_LIMIT;

        if (autoCount >= autoLimit) {
          summary.accountsSkipped++;
          continue;
        }

        // Calculate how many messages we can still send
        const remainingQuota = autoLimit - autoCount;
        const maxToQueue = Math.min(20, remainingQuota);

        if (maxToQueue <= 0) {
          summary.accountsSkipped++;
          continue;
        }

        const phoneNumbers = await this.phoneNumberRepository
          .createQueryBuilder('phoneNumber')
          .where('phoneNumber.accountId = :accountId', {
            accountId: account.id,
          })
          .andWhere('phoneNumber.hasStrangerBlockedError = :blocked', {
            blocked: false,
          })
          .andWhere('phoneNumber.hasScanInfo = :hasInfo', { hasInfo: true })
          .andWhere(
            new Brackets((qb) =>
              qb
                .where('phoneNumber.lastMessageSentAt IS NULL')
                .orWhere('phoneNumber.lastMessageSentAt < :todayStart'),
            ),
          )
          .andWhere('phoneNumber.id IS NOT NULL')
          .orderBy('phoneNumber.lastMessageSentAt IS NULL', 'DESC')
          .addOrderBy('phoneNumber.lastMessageSentAt', 'ASC')
          .addOrderBy('phoneNumber.id', 'ASC')
          .limit(maxToQueue)
          .setParameters({ todayStart })
          .getMany();

        if (phoneNumbers.length === 0) {
          summary.accountsSkipped++;
          continue;
        }

        const queueResult = await this.queueBulkMessages(
          phoneNumbers.map((p) => p.id),
          account.id,
          messageContent,
          { mode: 'auto' },
        );

        summary.accountsQueued++;
        summary.batchesQueued += queueResult.batchesQueued;
        if (queueResult.errors?.length) {
          summary.errors.push(...queueResult.errors.slice(0, 50));
        }
      } catch (error) {
        const errorMessage = `Account ${account.id}: ${
          error?.message || 'Không xác định'
        }`;
        this.logger.error(errorMessage);
        summary.errors.push(errorMessage);
        summary.accountsSkipped++;
      }
    }

    summary.message = `Đã xử lý ${summary.accountsProcessed}/${accounts.length} tài khoản gửi tin nhắn tự động`;
    return summary;
  }

  @Cron('0,30 9 * * *', {
    name: 'auto-send-bulk-messages-morning-9h',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async autoSendBulkMessagesMorning9hCron(): Promise<void> {
    try {
      const result = await this.autoSendBulkMessagesForEligibleAccounts();
      this.logger.log(
        `[Cron][9h] auto-send-bulk-messages: queued=${result.accountsQueued}, skipped=${result.accountsSkipped}, batches=${result.batchesQueued}`,
      );
    } catch (error) {
      this.logger.error(
        `[Cron][9h] auto-send-bulk-messages failed: ${
          (error as any)?.message || error
        }`,
      );
    }
  }

  @Cron('0,30 10 * * *', {
    name: 'auto-send-bulk-messages-morning-10h',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async autoSendBulkMessagesMorning10hCron(): Promise<void> {
    try {
      const result = await this.autoSendBulkMessagesForEligibleAccounts();
      this.logger.log(
        `[Cron][10h] auto-send-bulk-messages: queued=${result.accountsQueued}, skipped=${result.accountsSkipped}, batches=${result.batchesQueued}`,
      );
    } catch (error) {
      this.logger.error(
        `[Cron][10h] auto-send-bulk-messages failed: ${
          (error as any)?.message || error
        }`,
      );
    }
  }

  @Cron('0,30 14 * * *', {
    name: 'auto-send-bulk-messages-afternoon-14h',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async autoSendBulkMessagesAfternoon14hCron(): Promise<void> {
    try {
      const result = await this.autoSendBulkMessagesForEligibleAccounts();
      this.logger.log(
        `[Cron][14h] auto-send-bulk-messages: queued=${result.accountsQueued}, skipped=${result.accountsSkipped}, batches=${result.batchesQueued}`,
      );
    } catch (error) {
      this.logger.error(
        `[Cron][14h] auto-send-bulk-messages failed: ${
          (error as any)?.message || error
        }`,
      );
    }
  }

  @Cron('0,30 15 * * *', {
    name: 'auto-send-bulk-messages-afternoon-15h',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async autoSendBulkMessagesAfternoon15hCron(): Promise<void> {
    try {
      const result = await this.autoSendBulkMessagesForEligibleAccounts();
      this.logger.log(
        `[Cron][15h] auto-send-bulk-messages: queued=${result.accountsQueued}, skipped=${result.accountsSkipped}, batches=${result.batchesQueued}`,
      );
    } catch (error) {
      this.logger.error(
        `[Cron][15h] auto-send-bulk-messages failed: ${
          (error as any)?.message || error
        }`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'hourly-friend-sync',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async syncAllFriends(): Promise<{
    message: string;
    accountsQueued: number;
  }> {
    const now = new Date();
    this.logger.log(
      `Bắt đầu đồng bộ bạn bè (cronjob mỗi giờ) - giờ hiện tại: ${now.toISOString()}`,
    );

    const accounts = await this.accountRepository.find({
      where: { isConnect: 1 },
      select: ['id', 'userId', 'cookies'],
    });

    const eligibleAccounts = accounts.filter((account) => !!account.cookies);

    if (eligibleAccounts.length === 0) {
      return {
        message: 'Không có tài khoản hợp lệ để đồng bộ bạn bè',
        accountsQueued: 0,
      };
    }

    const hourKey = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    let queuedJobs = 0;

    for (const account of eligibleAccounts) {
      try {
        await this.scanQueue.add(
          'sync-account-friends',
          {
            accountId: account.id,
            userId: account.userId ?? 0,
          },
          {
            jobId: `sync-friends-${account.id}-${hourKey}`,
            removeOnComplete: true,
            removeOnFail: false,
            attempts: 2,
            backoff: {
              type: 'exponential',
              delay: 5000,
            },
          },
        );
        queuedJobs++;
      } catch (error) {
        this.logger.error(
          `Không thể xếp lịch đồng bộ bạn bè cho account ${account.id}: ${error.message}`,
        );
      }
    }

    const result = {
      message: `Đã xếp lịch đồng bộ bạn bè cho ${queuedJobs}/${eligibleAccounts.length} tài khoản`,
      accountsQueued: queuedJobs,
    };

    this.logger.log(result.message);
    return result;
  }

  async checkAndUpdateFriendStatus(accountId: number): Promise<{
    message: string;
    updated: number;
  }> {
    // Get all friends for this account
    const friends = await this.friendRepository.find({
      where: { accountId },
    });

    // Create a map of globalId to friends for this account
    const globalIdToFriendMap = new Map<string, Friend>();
    friends.forEach((friend) => {
      if (friend.globalId) {
        globalIdToFriendMap.set(friend.globalId, friend);
      }
    });

    // Get all phone numbers
    const phoneNumbers = await this.phoneNumberRepository.find();

    // Update phone numbers based on friend status (compare by globalId and accountId)
    let updated = 0;
    for (const phoneNumber of phoneNumbers) {
      if (phoneNumber.globalId) {
        const friend = globalIdToFriendMap.get(phoneNumber.globalId);

        if (friend) {
          // Found friend with matching globalId and accountId
          // Update phone number with friend info
          phoneNumber.isFriend = true;
          if (friend.avatar && !phoneNumber.avatar) {
            phoneNumber.avatar = friend.avatar;
          }
          if (friend.displayName && !phoneNumber.name) {
            phoneNumber.name = friend.displayName;
          }
          if (friend.zaloName && !phoneNumber.zaloName) {
            phoneNumber.zaloName = friend.zaloName;
          }
          if (friend.userId && !phoneNumber.uid) {
            phoneNumber.uid = friend.userId;
          }
          await this.phoneNumberRepository.save(phoneNumber);
          updated++;
        } else {
          // Not a friend for this account
          if (phoneNumber.isFriend) {
            phoneNumber.isFriend = false;
            await this.phoneNumberRepository.save(phoneNumber);
          }
        }
      } else {
        // Phone number doesn't have globalId, mark as not friend
        if (phoneNumber.isFriend) {
          phoneNumber.isFriend = false;
          await this.phoneNumberRepository.save(phoneNumber);
        }
      }
    }

    return {
      message: `Đã cập nhật trạng thái ${updated} số điện thoại`,
      updated,
    };
  }

  async sendFriendRequests(
    phoneNumberIds: number[],
    accountId: number,
    options?: { mode?: 'manual' | 'auto' },
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    // Validate all IDs
    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    const mode = options?.mode ?? 'manual';
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    let pendingDelta = 0;
    let totalSentIncrement = 0;

    let friendTracking: DailyScanTracking | null = null;
    let autoQuota = Infinity;
    if (mode === 'auto') {
      friendTracking = await this.getOrCreateDailyTracking(
        accountId,
        new Date(),
      );
      const limit =
        friendTracking.autoFriendRequestDailyLimit ??
        PhoneNumberService.AUTO_FRIEND_REQUEST_DAILY_LIMIT;
      const used = friendTracking.autoFriendRequestsSentToday || 0;
      autoQuota = Math.max(0, limit - used);
      if (autoQuota <= 0) {
        throw new BadRequestException(
          `Đã đạt giới hạn ${limit} lời mời kết bạn tự động trong ngày`,
        );
      }
    }

    for (const phoneNumber of phoneNumbers) {
      // Check if already friend
      if (phoneNumber.isFriend) {
        failed++;
        errors.push(`Số ${phoneNumber.phoneNumber} đã là bạn bè`);
        continue;
      }

      // Check if already sent friend request
      if (phoneNumber.hasSentFriendRequest === 1) {
        failed++;
        errors.push(`Đã gửi lời mời kết bạn cho số ${phoneNumber.phoneNumber}`);
        continue;
      }

      if (!phoneNumber.hasScanInfo) {
        failed++;
        errors.push(
          `Số ${phoneNumber.phoneNumber} chưa có thông tin đã quét. Vui lòng quét trước khi gửi lời mời.`,
        );
        continue;
      }

      // Check if has uid
      if (!phoneNumber.uid) {
        failed++;
        errors.push(
          `Số ${phoneNumber.phoneNumber} chưa có thông tin Zalo. Vui lòng quét thông tin trước.`,
        );
        continue;
      }

      if (mode === 'auto' && autoQuota <= 0) {
        failed++;
        errors.push(
          `Đã đạt giới hạn ${
            friendTracking?.autoFriendRequestDailyLimit ??
            PhoneNumberService.AUTO_FRIEND_REQUEST_DAILY_LIMIT
          } lời mời kết bạn tự động trong ngày`,
        );
        continue;
      }

      try {
        // Send friend request using ZaloService
        await this.zaloService.sendFriendRequest(
          accountId,
          0, // friendId not needed
          phoneNumber.uid,
        );

        // Update phone number
        phoneNumber.hasSentFriendRequest = 1;
        phoneNumber.friendRequestsSent =
          (phoneNumber.friendRequestsSent || 0) + 1;
        if (mode === 'auto') {
          phoneNumber.autoFriendRequestsSent =
            (phoneNumber.autoFriendRequestsSent || 0) + 1;
        } else {
          phoneNumber.manualFriendRequestsSent =
            (phoneNumber.manualFriendRequestsSent || 0) + 1;
        }
        phoneNumber.lastFriendRequestSentAt = new Date();
        await this.phoneNumberRepository.save(phoneNumber);

        friendTracking = await this.recordFriendRequestAction(
          accountId,
          phoneNumber,
          'send',
          mode,
          friendTracking ?? undefined,
        );
        if (mode === 'auto') {
          autoQuota = Math.max(
            0,
            autoQuota === Infinity ? Infinity : autoQuota - 1,
          );
        }
        pendingDelta += 1;
        success++;
        totalSentIncrement++;
      } catch (error) {
        failed++;
        errors.push(
          `Lỗi khi gửi lời mời cho ${phoneNumber.phoneNumber}: ${error.message}`,
        );
      }
    }

    let shouldPersistAccount = false;
    if (pendingDelta !== 0) {
      account.pendingFriendRequests = Math.max(
        0,
        (account.pendingFriendRequests || 0) + pendingDelta,
      );
      shouldPersistAccount = true;
    }

    if (totalSentIncrement > 0) {
      account.totalFriendRequestsSent =
        (account.totalFriendRequestsSent || 0) + totalSentIncrement;
      shouldPersistAccount = true;
    }

    if (shouldPersistAccount) {
      await this.accountRepository.save(account);
    }

    return { success, failed, errors: errors.slice(0, 50) };
  }

  async queueSendFriendRequests(
    phoneNumberIds: number[],
    accountId: number,
    options?: { mode?: 'manual' | 'auto' },
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const errors: string[] = [];
    const queuedPhoneIds: number[] = [];

    for (const phoneNumber of phoneNumbers) {
      if (phoneNumber.isFriend) {
        errors.push(`Số ${phoneNumber.phoneNumber} đã là bạn bè`);
        continue;
      }

      if (phoneNumber.hasSentFriendRequest === 1) {
        errors.push(`Đã gửi lời mời kết bạn cho số ${phoneNumber.phoneNumber}`);
        continue;
      }

      if (!phoneNumber.hasScanInfo) {
        errors.push(
          `Số ${phoneNumber.phoneNumber} chưa có thông tin đã quét. Vui lòng quét trước khi gửi lời mời.`,
        );
        continue;
      }

      if (!phoneNumber.uid) {
        errors.push(
          `Số ${phoneNumber.phoneNumber} chưa có thông tin Zalo. Vui lòng quét thông tin trước.`,
        );
        continue;
      }

      queuedPhoneIds.push(phoneNumber.id);
    }

    if (queuedPhoneIds.length === 0) {
      return {
        success: 0,
        failed: validIds.length,
        errors: errors.slice(0, 50),
      };
    }

    await this.scanQueue.add(
      'send-friend-requests-batch',
      {
        accountId,
        phoneNumberIds: queuedPhoneIds,
        mode: options?.mode ?? 'manual',
      },
      {
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    return {
      success: queuedPhoneIds.length,
      failed: validIds.length - queuedPhoneIds.length,
      errors: errors.slice(0, 50),
    };
  }

  async undoFriendRequests(
    phoneNumberIds: number[],
    accountId: number,
    userId?: number,
    options?: { mode?: 'manual' | 'auto' },
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    // Validate all IDs
    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    const mode = options?.mode ?? 'manual';
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    const actorId = userId ?? 0;
    let pendingDelta = 0;
    let friendTracking: DailyScanTracking | null = null;

    for (const phoneNumber of phoneNumbers) {
      if (phoneNumber.hasSentFriendRequest !== 1) {
        failed++;
        errors.push(
          `Chưa gửi lời mời kết bạn cho số ${phoneNumber.phoneNumber}`,
        );
        continue;
      }

      if (!phoneNumber.uid) {
        failed++;
        errors.push(
          `Số ${phoneNumber.phoneNumber} chưa có thông tin Zalo để thu hồi.`,
        );
        continue;
      }

      try {
        await this.zaloService.undoSentFriendRequest(
          accountId,
          phoneNumber.uid,
          actorId,
        );
        phoneNumber.hasSentFriendRequest = 0;
        phoneNumber.friendRequestsCanceled =
          (phoneNumber.friendRequestsCanceled || 0) + 1;
        if (mode === 'auto') {
          phoneNumber.autoFriendRequestsCanceled =
            (phoneNumber.autoFriendRequestsCanceled || 0) + 1;
        } else {
          phoneNumber.manualFriendRequestsCanceled =
            (phoneNumber.manualFriendRequestsCanceled || 0) + 1;
        }
        await this.phoneNumberRepository.save(phoneNumber);

        friendTracking = await this.recordFriendRequestAction(
          accountId,
          phoneNumber,
          'cancel',
          mode,
          friendTracking ?? undefined,
        );
        pendingDelta -= 1;
        success++;
      } catch (error) {
        failed++;
        errors.push(
          `Lỗi khi thu hồi lời mời của ${phoneNumber.phoneNumber}: ${
            error?.message || 'Không xác định'
          }`,
        );
      }
    }

    if (pendingDelta !== 0) {
      account.pendingFriendRequests = Math.max(
        0,
        (account.pendingFriendRequests || 0) + pendingDelta,
      );
      await this.accountRepository.save(account);
    }

    return { success, failed, errors: errors.slice(0, 50) };
  }

  async queueBulkMessages(
    phoneNumberIds: number[],
    accountId: number,
    message: string,
    options?: { mode?: 'manual' | 'auto' },
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
    batchesQueued: number;
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    if (!message || !message.trim()) {
      throw new BadRequestException('Vui lòng nhập nội dung tin nhắn');
    }

    const mode = options?.mode ?? 'manual';
    const BATCH_SIZE = 30; // Mỗi queue chứa 30 số

    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    const errors: string[] = [];
    const queuedPhoneIds: number[] = [];

    for (const phoneNumber of phoneNumbers) {
      if (!phoneNumber.uid) {
        errors.push(
          `Số ${phoneNumber.phoneNumber} chưa có thông tin Zalo. Vui lòng quét thông tin trước.`,
        );
        continue;
      }

      queuedPhoneIds.push(phoneNumber.id);
    }

    if (queuedPhoneIds.length === 0) {
      // Lưu tất cả lỗi vào database trước khi trả về
      for (const phoneNumber of phoneNumbers) {
        if (!phoneNumber.uid) {
          await this.logMessageHistory(
            phoneNumber.id,
            message,
            accountId,
            'failed',
            'Số điện thoại chưa có thông tin Zalo. Vui lòng quét thông tin trước.',
            mode,
          );
        }
      }
      return {
        success: 0,
        failed: validIds.length,
        errors: errors, // Trả về TẤT CẢ lỗi (đã được lưu vào DB)
        batchesQueued: 0,
      };
    }

    // Chia thành các batch 20 số mỗi queue
    const batches: number[][] = [];
    for (let i = 0; i < queuedPhoneIds.length; i += BATCH_SIZE) {
      batches.push(queuedPhoneIds.slice(i, i + BATCH_SIZE));
    }

    // Thêm từng batch vào queue
    // Mỗi batch 20 số sẽ được xử lý tuần tự trong processor với delay 15s giữa các tin nhắn
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      await this.scanQueue.add(
        'send-bulk-messages-batch', // Tên job type trong processor
        {
          accountId, // ID tài khoản để gửi tin
          phoneNumberIds: batch, // Mảng 20 số điện thoại ID
          message, // Nội dung tin nhắn
          mode, // 'manual' hoặc 'auto'
        },
        {
          // removeOnComplete: true -> Xóa job khỏi queue khi hoàn thành thành công
          // Giúp giảm dung lượng Redis, chỉ giữ lại các job đang chạy hoặc thất bại
          removeOnComplete: true,

          // removeOnFail: false -> Giữ lại job khi thất bại để có thể xem lại hoặc retry
          // Nếu set true thì sẽ mất thông tin về job thất bại
          removeOnFail: false,

          // attempts: 3 -> Số lần retry tối đa nếu job thất bại
          // Nếu job fail, Bull sẽ tự động retry tối đa 3 lần trước khi đánh dấu failed
          attempts: 3,

          // backoff: Cấu hình thời gian chờ giữa các lần retry
          backoff: {
            type: 'exponential', // Tăng dần theo cấp số nhân: 2s, 4s, 8s...
            delay: 2000, // Delay ban đầu là 2 giây (2000ms)
            // Lần retry 1: chờ 2s
            // Lần retry 2: chờ 4s
            // Lần retry 3: chờ 8s
          },
        },
      );
    }

    return {
      success: queuedPhoneIds.length,
      failed: validIds.length - queuedPhoneIds.length,
      errors: errors, // Trả về TẤT CẢ lỗi (đã được lưu vào DB qua logMessageHistory)
      batchesQueued: batches.length,
    };
  }

  async sendBulkMessages(
    phoneNumberIds: number[],
    accountId: number,
    message: string,
    options?: { mode?: 'manual' | 'auto' },
  ): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (phoneNumberIds.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một số điện thoại');
    }

    if (!message || !message.trim()) {
      throw new BadRequestException('Vui lòng nhập nội dung tin nhắn');
    }

    const mode = options?.mode ?? 'manual';

    // Validate all IDs
    const validIds = phoneNumberIds.filter(
      (id) => !Number.isNaN(id) && Number.isInteger(id) && id > 0,
    );
    if (validIds.length === 0) {
      throw new BadRequestException('Không có ID hợp lệ');
    }

    const phoneNumbers = await this.phoneNumberRepository.find({
      where: { id: In(validIds) },
    });

    if (phoneNumbers.length === 0) {
      throw new NotFoundException('Không tìm thấy số điện thoại');
    }

    const tracking = await this.getOrCreateDailyTracking(accountId, new Date());

    let manualCount = tracking.manualMessageToday || 0;
    let autoCount = tracking.autoMessageToday || 0;
    const autoLimit =
      tracking.limitAutoMessageToday ??
      PhoneNumberService.AUTO_MESSAGE_DAILY_LIMIT;

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const phoneNumber of phoneNumbers) {
      // Check if has uid (required to send message)
      if (!phoneNumber.uid) {
        failed++;
        const errorMsg =
          'Số điện thoại chưa có thông tin Zalo. Vui lòng quét thông tin trước.';
        errors.push(`Số ${phoneNumber.phoneNumber}: ${errorMsg}`);
        // Lưu vào lịch sử với trạng thái failed
        await this.logMessageHistory(
          phoneNumber.id,
          message,
          accountId,
          'failed',
          errorMsg,
          mode,
        );
        continue;
      }

      // Check auto message limit if in auto mode
      if (mode === 'auto') {
        if (autoCount >= autoLimit) {
          failed++;
          const errorMsg = `Đã đạt giới hạn ${autoLimit} tin nhắn tự động trong ngày cho tài khoản này`;
          errors.push(`Số ${phoneNumber.phoneNumber}: ${errorMsg}`);
          // Lưu vào lịch sử với trạng thái failed
          await this.logMessageHistory(
            phoneNumber.id,
            message,
            accountId,
            'failed',
            errorMsg,
            mode,
          );
          continue;
        }
        autoCount += 1;
      } else {
        manualCount += 1;
      }

      try {
        // Send message using ZaloService
        const sendResult: unknown = await this.zaloService.sendMessage(
          accountId,
          phoneNumber.uid,
          message,
        );

        // Kiểm tra xem có msgId hợp lệ không để xác định thành công thực sự
        const isValidSuccess = this.hasValidMsgId(sendResult);

        if (isValidSuccess) {
          success++;
          // Cập nhật trực tiếp trên phoneNumber object (giống như lastFriendRequestSentAt)
          phoneNumber.lastMessageSuccess = true;
          phoneNumber.hasMessageBlockedError = false;
          phoneNumber.hasStrangerBlockedError = false;
          phoneNumber.hasNoMsgIdError = false;
          await this.phoneNumberRepository.save(phoneNumber);

          // Lưu vào lịch sử với trạng thái thành công (có msgId)
          await this.logMessageHistory(
            phoneNumber.id,
            message,
            accountId,
            'sent',
            undefined,
            mode,
            sendResult,
          );
        } else {
          // Zalo trả về success nhưng không có msgId -> thực tế là thất bại
          failed++;
          const errorMsg =
            'Zalo đã trả về success nhưng không có msgId. Tin nhắn có thể không được gửi thực sự.';
          errors.push(`Số ${phoneNumber.phoneNumber}: ${errorMsg}`);

          // Cập nhật trực tiếp trên phoneNumber object
          phoneNumber.lastMessageSuccess = false;
          phoneNumber.hasNoMsgIdError = true;
          await this.phoneNumberRepository.save(phoneNumber);

          await this.logMessageHistory(
            phoneNumber.id,
            message,
            accountId,
            'sent', // Giữ status 'sent' để logMessageHistory tự động chuyển thành 'failed'
            undefined,
            mode,
            sendResult,
          );
        }
      } catch (error) {
        failed++;
        const errorMsg =
          error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : 'Không xác định';
        errors.push(
          `Lỗi khi gửi tin nhắn cho ${phoneNumber.phoneNumber}: ${errorMsg}`,
        );

        // Cập nhật trực tiếp trên phoneNumber object dựa trên loại lỗi
        phoneNumber.lastMessageSuccess = false;
        if (
          errorMsg.includes('Không thể nhận tin nhắn từ bạn') ||
          errorMsg.includes(
            'Gửi tin nhắn thất bại: Không thể nhận tin nhắn từ bạn',
          )
        ) {
          phoneNumber.hasMessageBlockedError = true;
        } else if (
          errorMsg.includes('chặn không nhận tin nhắn từ người lạ') ||
          errorMsg.includes(
            'Bạn chưa thể gửi tin nhắn đến người này vì người này chặn không nhận tin nhắn từ người lạ',
          )
        ) {
          phoneNumber.hasStrangerBlockedError = true;
        }
        await this.phoneNumberRepository.save(phoneNumber);

        // Lưu vào lịch sử với trạng thái thất bại và thông tin lỗi
        await this.logMessageHistory(
          phoneNumber.id,
          message,
          accountId,
          'failed',
          errorMsg,
          mode,
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
              }
            : { raw: String(error) },
        );
      }
    }

    tracking.manualMessageToday = manualCount;
    tracking.autoMessageToday = autoCount;
    await this.dailyScanTrackingRepository.save(tracking);

    // Trả về TẤT CẢ lỗi (đã được lưu vào DB qua logMessageHistory)
    // Mỗi lỗi đã được lưu vào bảng phone_number_messages với:
    // - status = 'failed'
    // - isSuccess = false
    // - error = <chi tiết lỗi>
    return { success, failed, errors: errors };
  }

  async getMessageDetails(
    accountId: number,
    mode: 'auto' | 'manual',
    date?: string,
  ): Promise<
    Array<{
      id: number;
      phoneNumberId: number;
      phoneNumberStr: string;
      phone?: {
        id: number;
        phoneNumber: string;
        name: string | null;
        zaloName: string | null;
        avatar: string | null;
        notes: string | null;
        isFriend: boolean;
        hasScanInfo: boolean;
        lastMessageSentAt: Date | null;
        lastMessageSuccess: boolean;
      };
      content: string;
      status: string;
      isSuccess: boolean | null;
      error: string | null;
      mode: 'auto' | 'manual';
      responsePayload: string | null;
      createdAt: string;
    }>
  > {
    // Parse date or use today
    let targetDate: Date;
    if (date) {
      targetDate = new Date(date + 'T00:00:00.000Z');
      if (isNaN(targetDate.getTime())) {
        throw new BadRequestException(
          'Ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD',
        );
      }
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    // Calculate date range for the day
    const startDate = new Date(targetDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);

    // Query messages for the account and date
    // Filter by mode field (new) or type field (backward compatibility)
    const messages = await this.phoneNumberMessageRepository.find({
      where: {
        accountId,
        createdAt: Between(startDate, endDate),
      },
      relations: ['phoneNumber'],
      order: {
        createdAt: 'DESC',
      },
    });

    // Filter by mode - use mode field if available, otherwise fallback to type field
    const filteredMessages = messages.filter((msg) => {
      // First check the new mode field
      if (msg.mode) {
        return msg.mode === mode;
      }
      // Backward compatibility: check type field for old messages
      if (msg.type === `text-${mode}`) {
        return true;
      }
      // For backward compatibility, if type is just 'text' or null, include it for manual mode
      // (old messages before mode was stored)
      if (!msg.type || msg.type === 'text') {
        return mode === 'manual'; // Default to manual for old messages
      }
      return false;
    });

    return filteredMessages.map((msg) => ({
      id: msg.id,
      phoneNumberId: msg.phoneNumberId,
      phoneNumberStr: msg.phoneNumber?.phoneNumber || '',
      phone: msg.phoneNumber
        ? {
            id: msg.phoneNumber.id,
            phoneNumber: msg.phoneNumber.phoneNumber,
            name: msg.phoneNumber.name || null,
            zaloName: msg.phoneNumber.zaloName || null,
            avatar: msg.phoneNumber.avatar || null,
            notes: msg.phoneNumber.notes || null,
            isFriend: !!msg.phoneNumber.isFriend,
            hasScanInfo: !!msg.phoneNumber.hasScanInfo,
            lastMessageSentAt: msg.phoneNumber.lastMessageSentAt || null,
            lastMessageSuccess: !!msg.phoneNumber.lastMessageSuccess,
          }
        : undefined,
      content: msg.content,
      status: msg.status || 'sent',
      isSuccess: msg.isSuccess,
      error: msg.error || null,
      mode: msg.mode || 'manual',
      responsePayload: msg.responsePayload || null,
      createdAt: msg.createdAt.toISOString(),
    }));
  }
}
