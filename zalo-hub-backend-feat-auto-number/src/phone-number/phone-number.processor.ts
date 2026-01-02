import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { PhoneNumber } from './entities/phone-number.entity';
import { ZaloService } from '../zalo/zalo.service';
import { PhoneNumberService } from './phone-number.service';

interface ScanPhoneNumberItem {
  phoneNumberId: number;
  phoneNumber: string;
}

interface ScanPhoneNumberJob {
  batch: ScanPhoneNumberItem[];
  accountId: number;
}

interface SyncAccountFriendsJob {
  accountId: number;
  userId: number;
}

interface ImportPhoneNumbersBatchJob {
  batch: string[];
  accountId: number;
  userId: number;
  batchIndex: number;
  totalBatches: number;
}

interface SendFriendRequestsBatchJob {
  accountId: number;
  phoneNumberIds: number[];
  mode: 'manual' | 'auto';
}

interface SendBulkMessagesBatchJob {
  accountId: number;
  phoneNumberIds: number[];
  message: string;
  mode: 'manual' | 'auto';
}

@Processor('phone-number-scan')
@Injectable()
export class PhoneNumberProcessor {
  constructor(
    @InjectRepository(PhoneNumber)
    private readonly phoneNumberRepository: Repository<PhoneNumber>,
    private readonly zaloService: ZaloService,
    @Inject(forwardRef(() => PhoneNumberService))
    private readonly phoneNumberService: PhoneNumberService,
  ) {}

  @Process({
    name: 'scan-batch',
    concurrency: 1, // Process one batch at a time
  })
  async handleScanBatch(job: Job<ScanPhoneNumberJob>) {
    const { batch, accountId } = job.data;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const totalItems = batch.length;

    // Process each phone number in the batch
    for (let index = 0; index < batch.length; index++) {
      const item = batch[index];
      const { phoneNumberId, phoneNumber } = item;

      let phoneNumberEntity: PhoneNumber | null = null;
      let scanAttempted = false;
      let initialScanCount = 0;

      try {
        // Get phone number entity first
        phoneNumberEntity = await this.phoneNumberRepository.findOne({
          where: { id: phoneNumberId },
        });

        if (!phoneNumberEntity) {
          results.failed++;
          results.errors.push(
            `Phone number with ID ${phoneNumberId} not found`,
          );
          continue;
        }

        // Store initial scanCount to check if it was already incremented (retry case)
        initialScanCount = phoneNumberEntity.scanCount || 0;

        // Mark that we're attempting to scan
        scanAttempted = true;

        // Scan phone number
        const result = await this.zaloService.scanPhoneNumber(
          accountId,
          phoneNumber,
        );

        if (result) {
          // Update phone number with all scanned information
          phoneNumberEntity.name =
            result.display_name || result.zalo_name || phoneNumberEntity.name;
          phoneNumberEntity.avatar = result.avatar || phoneNumberEntity.avatar;
          phoneNumberEntity.cover = result.cover || phoneNumberEntity.cover;
          phoneNumberEntity.status = result.status || phoneNumberEntity.status;
          phoneNumberEntity.gender =
            result.gender !== undefined
              ? result.gender
              : phoneNumberEntity.gender;
          phoneNumberEntity.dob = result.dob || phoneNumberEntity.dob;
          phoneNumberEntity.sdob = result.sdob || phoneNumberEntity.sdob;
          phoneNumberEntity.globalId =
            result.globalId || phoneNumberEntity.globalId;
          phoneNumberEntity.bizPkg = result.bizPkg
            ? JSON.stringify(result.bizPkg)
            : phoneNumberEntity.bizPkg;
          phoneNumberEntity.uid = result.uid || phoneNumberEntity.uid;
          phoneNumberEntity.zaloName =
            result.zalo_name || phoneNumberEntity.zaloName;
          phoneNumberEntity.displayName =
            result.display_name || phoneNumberEntity.displayName;
          phoneNumberEntity.lastScannedAt = new Date();
          phoneNumberEntity.hasScanInfo = true;

          await this.phoneNumberRepository.save(phoneNumberEntity);

          // Record scan in daily tracking
          try {
            await this.phoneNumberService.recordScan(
              accountId,
              phoneNumberId,
              phoneNumber,
              true,
            );
          } catch (trackError) {
            // Log but don't fail the job if tracking fails
            console.error(
              'Failed to record scan in daily tracking:',
              trackError,
            );
          }

          results.success++;
        } else {
          phoneNumberEntity.hasScanInfo = false;
          phoneNumberEntity.lastScannedAt = new Date();
          await this.phoneNumberRepository.save(phoneNumberEntity);

          // Record scan in daily tracking (without info)
          try {
            await this.phoneNumberService.recordScan(
              accountId,
              phoneNumberId,
              phoneNumber,
              false,
            );
          } catch (trackError) {
            // Log but don't fail the job if tracking fails
            console.error(
              'Failed to record scan in daily tracking:',
              trackError,
            );
          }

          results.failed++;
          results.errors.push(`Không tìm thấy thông tin cho số ${phoneNumber}`);
        }
      } catch (error) {
        // Update hasScanInfo to false on error
        if (phoneNumberEntity) {
          try {
            phoneNumberEntity.hasScanInfo = false;
            phoneNumberEntity.lastScannedAt = new Date();
            await this.phoneNumberRepository.save(phoneNumberEntity);
          } catch (saveError) {
            // Ignore save errors
          }
        } else {
          // Try to get entity if not found earlier
          try {
            const entity = await this.phoneNumberRepository.findOne({
              where: { id: phoneNumberId },
            });
            if (entity) {
              entity.hasScanInfo = false;
              entity.lastScannedAt = new Date();
              await this.phoneNumberRepository.save(entity);
            }
          } catch (saveError) {
            // Ignore save errors
          }
        }

        // Record scan in daily tracking (without info)
        try {
          await this.phoneNumberService.recordScan(
            accountId,
            phoneNumberId,
            phoneNumber,
            false,
          );
        } catch (trackError) {
          // Log but don't fail the job if tracking fails
          console.error('Failed to record scan in daily tracking:', trackError);
        }

        results.failed++;
        results.errors.push(`Lỗi khi quét ${phoneNumber}: ${error.message}`);
      } finally {
        // Increment scan count only if scan was attempted
        // Check if scanCount was already incremented (retry case) by comparing with initial value
        if (phoneNumberEntity && scanAttempted) {
          try {
            // Re-fetch to get current scanCount (might have been incremented in retry)
            const currentEntity = await this.phoneNumberRepository.findOne({
              where: { id: phoneNumberId },
              select: ['id', 'scanCount'],
            });

            // Only increment if scanCount hasn't changed from initial value
            // This means it hasn't been incremented yet (not a retry)
            if (currentEntity && currentEntity.scanCount === initialScanCount) {
              await this.phoneNumberRepository.increment(
                { id: phoneNumberId },
                'scanCount',
                1,
              );
            }
            // If scanCount has changed, it means it was already incremented in a previous attempt (retry)
            // Don't increment again
          } catch (incrementError) {
            // Ignore increment errors, but log if needed
            console.error(
              `Failed to increment scanCount for phone ${phoneNumberId}:`,
              incrementError,
            );
          }
        }
      }

      // Update job progress to keep lock alive
      const progress = Math.round(((index + 1) / totalItems) * 100);
      await job.progress(progress);

      // Delay 5 seconds between scans to avoid rate limiting
      // Only delay if not the last item in the batch
      if (index < batch.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    return {
      batchSize: batch.length,
      ...results,
    };
  }

  @Process({
    name: 'sync-account-friends',
    concurrency: 1,
  })
  async handleSyncAccountFriends(job: Job<SyncAccountFriendsJob>) {
    const { accountId, userId } = job.data;
    return await this.zaloService.syncFriends(accountId, userId);
  }

  @Process({
    name: 'import-phone-numbers-batch',
    concurrency: 2, // Process 2 batches concurrently
  })
  async handleImportPhoneNumbersBatch(job: Job<ImportPhoneNumbersBatchJob>) {
    const { batch, accountId, userId, batchIndex, totalBatches } = job.data;

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    const totalItems = batch.length;

    for (let index = 0; index < batch.length; index++) {
      const phoneNumberStr = batch[index];

      try {
        // Check if already exists with the same accountId
        const whereCondition: any = {
          phoneNumber: phoneNumberStr,
          accountId:
            accountId !== undefined && accountId !== null
              ? accountId
              : IsNull(),
        };

        const existing = await this.phoneNumberRepository.findOne({
          where: whereCondition,
        });

        if (existing) {
          results.failed++;
          results.errors.push(`Số điện thoại đã tồn tại: ${phoneNumberStr}`);
          continue;
        }

        // Create new phone number
        await this.phoneNumberRepository.save({
          phoneNumber: phoneNumberStr,
          userId,
          accountId,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Lỗi khi import ${phoneNumberStr}: ${error.message}`,
        );
      }

      // Update job progress
      const progress = Math.round(((index + 1) / totalItems) * 100);
      await job.progress(progress);
    }

    return {
      batchIndex,
      totalBatches,
      batchSize: batch.length,
      ...results,
    };
  }

  @Process({
    name: 'send-friend-requests-batch',
    concurrency: 1,
  })
  async handleSendFriendRequestsBatch(job: Job<SendFriendRequestsBatchJob>) {
    const { accountId, phoneNumberIds, mode } = job.data;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let index = 0; index < phoneNumberIds.length; index++) {
      const phoneNumberId = phoneNumberIds[index];

      try {
        const response = await this.phoneNumberService.sendFriendRequests(
          [phoneNumberId],
          accountId,
          { mode },
        );
        results.success += response.success;
        results.failed += response.failed;
        if (response.errors?.length) {
          results.errors.push(...response.errors);
        }
      } catch (error) {
        results.failed += 1;
        results.errors.push(
          `Không thể gửi lời mời cho phoneNumberId=${phoneNumberId}: ${
            error?.message || 'Không xác định'
          }`,
        );
      }

      const progress = Math.round(((index + 1) / phoneNumberIds.length) * 100);
      await job.progress(progress);

      if (index < phoneNumberIds.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    results.errors = results.errors.slice(0, 50);
    return results;
  }

  @Process({
    name: 'send-bulk-messages-batch',
    concurrency: 1,
  })
  async handleSendBulkMessagesBatch(job: Job<SendBulkMessagesBatchJob>) {
    const { accountId, phoneNumberIds, message, mode } = job.data;
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let index = 0; index < phoneNumberIds.length; index++) {
      const phoneNumberId = phoneNumberIds[index];

      try {
        const response = await this.phoneNumberService.sendBulkMessages(
          [phoneNumberId],
          accountId,
          message,
          { mode },
        );
        results.success += response.success;
        results.failed += response.failed;
        if (response.errors?.length) {
          results.errors.push(...response.errors);
        }
      } catch (error) {
        results.failed += 1;
        results.errors.push(
          `Không thể gửi tin nhắn cho phoneNumberId=${phoneNumberId}: ${
            (error as any)?.message || 'Không xác định'
          }`,
        );
      }

      const progress = Math.round(((index + 1) / phoneNumberIds.length) * 100);
      await job.progress(progress);

      if (index < phoneNumberIds.length - 1) {
        // Delay 15 seconds between messages to avoid Zalo rate limiting
        await new Promise((resolve) => setTimeout(resolve, 45000));
      }
    }

    // Không giới hạn số lỗi trong response vì tất cả đã được lưu vào DB
    // Mỗi lỗi đã được lưu vào bảng phone_number_messages qua sendBulkMessages
    return results;
  }
}
