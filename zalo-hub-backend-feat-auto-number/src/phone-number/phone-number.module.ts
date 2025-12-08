import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PhoneNumberController } from './phone-number.controller';
import { PhoneNumberService } from './phone-number.service';
import { PhoneNumberProcessor } from './phone-number.processor';
import { PhoneNumber } from './entities/phone-number.entity';
import { PhoneNumberMessage } from './entities/phone-number-message.entity';
import { DailyScanTracking } from './entities/daily-scan-tracking.entity';
import { Friend } from '../friend/entities/friend.entity';
import { Account } from '../account/entities/account.entity';
import { JwtModule } from '@nestjs/jwt';
import { ZaloModule } from '../zalo/zalo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PhoneNumber,
      PhoneNumberMessage,
      DailyScanTracking,
      Friend,
      Account,
    ]),
    JwtModule,
    BullModule.registerQueue({
      name: 'phone-number-scan',
      settings: {
        stalledInterval: 0, // Check for stalled jobs every 30 seconds
        maxStalledCount: 0, // Max times a job can be stalled before failing
      },
      defaultJobOptions: {
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours
        },
        timeout: 600000, // 10 minutes timeout per job (50 numbers * ~12 seconds each)
      },
    }),
    forwardRef(() => ZaloModule),
  ],
  controllers: [PhoneNumberController],
  providers: [PhoneNumberService, PhoneNumberProcessor],
  exports: [PhoneNumberService],
})
export class PhoneNumberModule {}
