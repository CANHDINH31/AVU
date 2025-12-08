import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PhoneNumberService } from './phone-number.service';
import {
  DailyScanPhoneDetail,
  FriendRequestDetail,
} from './entities/daily-scan-tracking.entity';
import { CreatePhoneNumberDto } from './dto/create-phone-number.dto';
import { UpdatePhoneNumberDto } from './dto/update-phone-number.dto';
import {
  GetPhoneNumbersDto,
  BulkDeleteDto,
  ScanPhoneNumbersDto,
  SendBulkMessagesDto,
} from './dto/get-phone-numbers.dto';
import {
  PhoneNumberResponseDto,
  PhoneNumbersListResponseDto,
  ImportExcelResponseDto,
  BulkOperationResponseDto,
} from './dto/phone-number-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Response } from 'express';

@ApiTags('phone-numbers')
@Controller('phone-numbers')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PhoneNumberController {
  constructor(private readonly phoneNumberService: PhoneNumberService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new phone number' })
  @ApiResponse({
    status: 201,
    description: 'Phone number created successfully',
    type: PhoneNumberResponseDto,
  })
  async create(
    @Body() createDto: CreatePhoneNumberDto,
    @Req() req: any,
  ): Promise<PhoneNumberResponseDto> {
    const phoneNumber = await this.phoneNumberService.create(
      createDto,
      req.user.sub,
    );
    return PhoneNumberResponseDto.fromEntity(phoneNumber);
  }

  @Get()
  @ApiOperation({ summary: 'Get all phone numbers with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Phone numbers retrieved successfully',
    type: PhoneNumbersListResponseDto,
  })
  async findAll(
    @Query() query: GetPhoneNumbersDto,
    @Req() req: any,
  ): Promise<PhoneNumbersListResponseDto> {
    const result = await this.phoneNumberService.findAll(query, req.user.sub);
    return {
      data: result.data.map((pn) => PhoneNumberResponseDto.fromEntity(pn)),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  }

  @Get('export-csv')
  @ApiOperation({
    summary: 'Export phone numbers to CSV file with filters (no pagination)',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
        },
      },
    },
  })
  async exportCsv(
    @Query() query: Omit<GetPhoneNumbersDto, 'page' | 'pageSize'>,
    @Req() req: any,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const csvContent = await this.phoneNumberService.exportCsv(
        query,
        req.user?.sub,
      );

      // Format filename with date and time: phone-numbers-YYYY-MM-DD-HHMMSS.csv
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const filename = `phone-numbers-${year}-${month}-${day}-${hours}${minutes}${seconds}.csv`;

      res.setHeader('Content-Type', 'text/csv;charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      // Add BOM for Excel UTF-8 support
      res.send('\uFEFF' + csvContent);
    } catch (error) {
      throw error;
    }
  }

  @Get('export-excel')
  @ApiOperation({ summary: 'Export phone numbers to Excel file' })
  @ApiResponse({
    status: 200,
    description: 'Excel file generated',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportExcel(@Res() res: Response): Promise<void> {
    const buffer = await this.phoneNumberService.exportExcel();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=phone-numbers-${new Date().toISOString()}.xlsx`,
    );
    res.send(buffer);
  }

  @Get('daily-statistics')
  @ApiOperation({ summary: 'Get daily scan statistics' })
  @ApiQuery({
    name: 'accountId',
    type: 'number',
    required: true,
    description: 'Account ID',
  })
  @ApiQuery({
    name: 'date',
    type: 'string',
    required: false,
    description: 'Date in YYYY-MM-DD format (default: today)',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily statistics retrieved successfully',
  })
  async getDailyStatistics(
    @Query('accountId') accountId: string,
    @Query('date') date?: string,
  ): Promise<{
    date: string;
    totalScanned: number;
    withInfo: number;
    withoutInfo: number;
    dailyScanCount: number;
    manualScanCount: number;
    maxScansPerDay: number;
    remaining: number;
    scanEnabled: boolean;
    withInfoDetails: DailyScanPhoneDetail[];
    withoutInfoDetails: DailyScanPhoneDetail[];
    manualWithInfoDetails: DailyScanPhoneDetail[];
    manualWithoutInfoDetails: DailyScanPhoneDetail[];
    autoFriendRequestsSentToday: number;
    autoFriendRequestsCanceledToday: number;
    autoFriendRequestsSentTotal: number;
    autoFriendRequestsCanceledTotal: number;
    manualFriendRequestsSentToday: number;
    manualFriendRequestsCanceledToday: number;
    manualFriendRequestsSentTotal: number;
    manualFriendRequestsCanceledTotal: number;
    autoFriendRequestDetails: FriendRequestDetail[];
    autoFriendCancelDetails: FriendRequestDetail[];
    manualFriendRequestDetails: FriendRequestDetail[];
    manualFriendCancelDetails: FriendRequestDetail[];
    autoFriendRequestDailyLimit: number;
    manualMessageToday: number;
    autoMessageToday: number;
    limitAutoMessageToday: number;
  }> {
    const accountIdNum = Number(accountId);
    if (Number.isNaN(accountIdNum) || accountIdNum <= 0) {
      throw new BadRequestException('Account ID không hợp lệ');
    }
    return await this.phoneNumberService.getDailyStatistics(accountIdNum, date);
  }

  @Get('daily-scan-limit')
  @ApiOperation({ summary: 'Check daily scan limit' })
  @ApiQuery({
    name: 'accountId',
    type: 'number',
    required: true,
    description: 'Account ID',
  })
  @ApiQuery({
    name: 'requestedCount',
    type: 'number',
    required: false,
    description: 'Number of scans requested (default: 1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Scan limit check result',
  })
  async checkDailyScanLimit(
    @Query('accountId') accountId: string,
    @Query('requestedCount') requestedCount?: string,
  ): Promise<{
    canScan: boolean;
    currentCount: number;
    maxAllowed: number;
    remaining: number;
  }> {
    const accountIdNum = Number(accountId);
    if (Number.isNaN(accountIdNum) || accountIdNum <= 0) {
      throw new BadRequestException('Account ID không hợp lệ');
    }
    const requestedCountNum = requestedCount
      ? Number(requestedCount)
      : undefined;
    if (
      requestedCountNum !== undefined &&
      (Number.isNaN(requestedCountNum) || requestedCountNum < 0)
    ) {
      throw new BadRequestException('Requested count không hợp lệ');
    }
    return await this.phoneNumberService.checkDailyScanLimit(
      accountIdNum,
      requestedCountNum,
    );
  }

  @Get('scan-all-queue')
  async scanAllPhoneNumbersWithQueue(): Promise<{
    message: string;
    totalJobs: number;
    batches: number;
    accountsProcessed: number;
  }> {
    return await this.phoneNumberService.scanAllPhoneNumbersWithQueue();
  }

  @Get('message-details')
  @ApiOperation({ summary: 'Get message details by account, mode and date' })
  @ApiQuery({
    name: 'accountId',
    type: 'number',
    required: true,
    description: 'Account ID',
  })
  @ApiQuery({
    name: 'mode',
    type: 'string',
    required: true,
    description: 'Mode: auto or manual',
    enum: ['auto', 'manual'],
  })
  @ApiQuery({
    name: 'date',
    type: 'string',
    required: false,
    description: 'Date in YYYY-MM-DD format (default: today)',
  })
  @ApiResponse({
    status: 200,
    description: 'Message details retrieved successfully',
  })
  async getMessageDetails(
    @Query('accountId') accountId: string,
    @Query('mode') mode: string,
    @Query('date') date?: string,
  ): Promise<
    Array<{
      id: number;
      phoneNumberId: number;
      phoneNumberStr: string;
      content: string;
      status: string;
      isSuccess: boolean | null;
      error: string | null;
      createdAt: string;
    }>
  > {
    const accountIdNum = Number(accountId);
    if (Number.isNaN(accountIdNum) || accountIdNum <= 0) {
      throw new BadRequestException('Account ID không hợp lệ');
    }

    if (mode !== 'auto' && mode !== 'manual') {
      throw new BadRequestException('Mode phải là "auto" hoặc "manual"');
    }

    return await this.phoneNumberService.getMessageDetails(
      accountIdNum,
      mode,
      date,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a phone number by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number retrieved successfully',
    type: PhoneNumberResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<PhoneNumberResponseDto> {
    // Trim and validate input
    const trimmedId = id?.trim();
    if (!trimmedId || trimmedId === '') {
      throw new BadRequestException('ID không được để trống');
    }

    const numericId = Number(trimmedId);
    if (
      Number.isNaN(numericId) ||
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
    const phoneNumber = await this.phoneNumberService.findOne(numericId);
    return PhoneNumberResponseDto.fromEntity(phoneNumber);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a phone number' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number updated successfully',
    type: PhoneNumberResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePhoneNumberDto,
  ): Promise<PhoneNumberResponseDto> {
    // Trim and validate input
    const trimmedId = id?.trim();
    if (!trimmedId || trimmedId === '') {
      throw new BadRequestException('ID không được để trống');
    }

    const numericId = Number(trimmedId);
    if (
      Number.isNaN(numericId) ||
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
    const phoneNumber = await this.phoneNumberService.update(
      numericId,
      updateDto,
    );
    return PhoneNumberResponseDto.fromEntity(phoneNumber);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a phone number' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Phone number deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    // Trim and validate input
    const trimmedId = id?.trim();
    if (!trimmedId || trimmedId === '') {
      throw new BadRequestException('ID không được để trống');
    }

    const numericId = Number(trimmedId);
    if (
      Number.isNaN(numericId) ||
      !Number.isInteger(numericId) ||
      numericId <= 0
    ) {
      throw new BadRequestException(`ID không hợp lệ: ${id}`);
    }
    await this.phoneNumberService.remove(numericId);
    return { message: 'Xóa số điện thoại thành công' };
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple phone numbers' })
  @ApiResponse({
    status: 200,
    description: 'Phone numbers deleted successfully',
  })
  async bulkDelete(@Body() body: BulkDeleteDto): Promise<{
    message: string;
    success: number;
    failed: number;
    invalidIds: number[];
    errors: string[];
  }> {
    const result = await this.phoneNumberService.bulkDelete(body.ids);
    return {
      message:
        result.success > 0
          ? `Đã xóa thành công ${result.success} số điện thoại${
              result.failed > 0 ? `, ${result.failed} thất bại` : ''
            }`
          : 'Không có số điện thoại nào được xóa',
      ...result,
    };
  }

  @Post('import-excel')
  @ApiOperation({ summary: 'Import phone numbers from Excel file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        accountId: {
          type: 'number',
          description: 'Account ID to associate imported phone numbers with',
        },
      },
      required: ['file', 'accountId'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: 200,
    description: 'Import completed',
    type: ImportExcelResponseDto,
  })
  async importExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { accountId?: number | string },
    @Req() req: any,
  ): Promise<ImportExcelResponseDto> {
    const accountId =
      body?.accountId !== undefined ? Number(body.accountId) : undefined;
    return await this.phoneNumberService.importExcel(
      file,
      req.user.sub,
      accountId,
    );
  }

  @Post('scan')
  @ApiOperation({ summary: 'Scan phone numbers to get user information' })
  @ApiResponse({
    status: 200,
    description: 'Scan completed',
    type: BulkOperationResponseDto,
  })
  async scanPhoneNumbers(
    @Body() body: ScanPhoneNumbersDto,
  ): Promise<BulkOperationResponseDto> {
    return await this.phoneNumberService.scanPhoneNumbers(
      body.ids,
      body.accountId,
    );
  }

  @Post('sync-friends')
  @ApiOperation({ summary: 'Sync friends from Zalo' })
  @ApiResponse({
    status: 200,
    description: 'Sync completed',
  })
  async syncFriends(
    @Body() body: { accountId: number },
    @Req() req: any,
  ): Promise<{
    message: string;
    totalFriends: number;
  }> {
    return await this.phoneNumberService.syncFriends(
      body.accountId,
      req.user?.sub,
    );
  }

  @Post('check-friend-status')
  @ApiOperation({
    summary: 'Check and update friend status by comparing globalId',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend status updated',
  })
  async checkAndUpdateFriendStatus(
    @Body() body: { accountId: number },
  ): Promise<{
    message: string;
    updated: number;
  }> {
    return await this.phoneNumberService.checkAndUpdateFriendStatus(
      body.accountId,
    );
  }

  @Post('send-friend-requests')
  @ApiOperation({ summary: 'Send friend requests to selected phone numbers' })
  @ApiResponse({
    status: 200,
    description: 'Friend requests sent',
    type: BulkOperationResponseDto,
  })
  async sendFriendRequests(
    @Body() body: ScanPhoneNumbersDto,
  ): Promise<BulkOperationResponseDto> {
    return await this.phoneNumberService.queueSendFriendRequests(
      body.ids,
      body.accountId,
    );
  }

  @Post('auto-send-friend-requests')
  @ApiOperation({
    summary: 'Tự động gửi lời mời kết bạn cho toàn bộ account đủ điều kiện',
  })
  async autoSendFriendRequests(): Promise<{
    message: string;
    accountsProcessed: number;
    accountsSkipped: number;
    friendRequestsSent: number;
    friendRequestsCanceled: number;
    errors: string[];
  }> {
    return await this.phoneNumberService.autoSendFriendRequestsForAllAccounts();
  }

  @Post('undo-friend-requests')
  @ApiOperation({
    summary: 'Undo friend requests that were previously sent',
  })
  @ApiResponse({
    status: 200,
    description: 'Friend requests revoked',
    type: BulkOperationResponseDto,
  })
  async undoFriendRequests(
    @Body() body: ScanPhoneNumbersDto,
    @Req() req: any,
  ): Promise<BulkOperationResponseDto> {
    return await this.phoneNumberService.undoFriendRequests(
      body.ids,
      body.accountId,
      req.user?.sub,
    );
  }

  @Post('send-bulk-messages')
  @ApiOperation({ summary: 'Send bulk messages to selected phone numbers' })
  @ApiResponse({
    status: 200,
    description: 'Messages sent',
    type: BulkOperationResponseDto,
  })
  async sendBulkMessages(
    @Body() body: SendBulkMessagesDto,
  ): Promise<BulkOperationResponseDto> {
    return await this.phoneNumberService.queueBulkMessages(
      body.ids,
      body.accountId,
      body.message,
      { mode: 'manual' },
    );
  }

  @Post('auto-send-bulk-messages')
  @ApiOperation({
    summary:
      'Tự động gửi tin nhắn hàng loạt cho các tài khoản bật auto message',
  })
  async autoSendBulkMessages(): Promise<{
    message: string;
    accountsProcessed: number;
    accountsQueued: number;
    accountsSkipped: number;
    batchesQueued: number;
    errors: string[];
  }> {
    return await this.phoneNumberService.autoSendBulkMessagesForEligibleAccounts();
  }

  @Post('toggle-daily-scan')
  @ApiOperation({
    summary: 'Bật/Tắt chế độ quét tự động theo lịch cho tài khoản',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accountId: { type: 'number', description: 'Account ID' },
        enabled: {
          type: 'boolean',
          description: 'Trạng thái muốn bật/tắt',
        },
      },
      required: ['accountId', 'enabled'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái quét tự động thành công',
  })
  async toggleDailyScan(
    @Body() body: { accountId: number; enabled: boolean },
  ): Promise<{ message: string; scanEnabled: boolean }> {
    const accountIdNum = Number(body.accountId);
    if (Number.isNaN(accountIdNum) || accountIdNum <= 0) {
      throw new BadRequestException('Account ID không hợp lệ');
    }
    if (typeof body.enabled !== 'boolean') {
      throw new BadRequestException('Trạng thái bật/tắt không hợp lệ');
    }

    return await this.phoneNumberService.updateDailyScanStatus(
      accountIdNum,
      body.enabled,
    );
  }
}
