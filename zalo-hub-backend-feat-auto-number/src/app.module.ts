import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { ZaloModule } from './zalo/zalo.module';
import { Account } from './account/entities/account.entity';
import { AccountModule } from './account/account.module';
import { RedisModule } from './redis/redis.module';
import { Friend } from './friend/entities/friend.entity';
import { FriendModule } from './friend/friend.module';
import { ConversationModule } from './conversation/conversation.module';
import { Conversation } from './conversation/entities/conversation.entity';
import { MessageModule } from './message/message.module';
import { Message } from './message/entities/message.entity';
import { FailedFileStorage } from './message/entities/failed-file-storage.entity';
import { ReactionModule } from './reaction/reaction.module';
import { Reaction } from './reaction/entities/reaction.entity';
import { StickerModule } from './sticker/sticker.module';
import { Sticker } from './sticker/entities/sticker.entity';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendRequest } from './friend-request/entities/friend-request.entity';
import { SentFriendRequestModule } from './sent-friend-request/sent-friend-request.module';
import { SentFriendRequest } from './sent-friend-request/entities/sent-friend-request.entity';
import { AdminModule } from './admin/admin.module';
import { Territory } from './territory/entities/territory.entity';
import { TerritoryModule } from './territory/territory.module';
import { Folder } from './folder/entities/folder.entity';
import { FolderModule } from './folder/folder.module';
import { UploadPermissions } from './upload/entities/upload-permissions.entity';
import { UploadModule } from './upload/upload.module';
import { PhoneNumber } from './phone-number/entities/phone-number.entity';
import { PhoneNumberMessage } from './phone-number/entities/phone-number-message.entity';
import { DailyScanTracking } from './phone-number/entities/daily-scan-tracking.entity';
import { PhoneNumberModule } from './phone-number/phone-number.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [
          User,
          Account,
          Friend,
          Conversation,
          Message,
          Reaction,
          Sticker,
          FriendRequest,
          SentFriendRequest,
          Territory,
          Folder,
          UploadPermissions,
          FailedFileStorage,
          PhoneNumber,
          PhoneNumberMessage,
          DailyScanTracking,
        ],
        synchronize: false,
        migrations: ['./migrations/*.ts'],
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ZaloModule,
    AccountModule,
    RedisModule,
    FriendModule,
    ConversationModule,
    MessageModule,
    ReactionModule,
    StickerModule,
    FriendRequestModule,
    SentFriendRequestModule,
    AdminModule,
    TerritoryModule,
    FolderModule,
    UploadModule,
    PhoneNumberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
