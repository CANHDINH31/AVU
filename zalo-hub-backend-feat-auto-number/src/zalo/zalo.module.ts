import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ZaloService } from './zalo.service';
import { ZaloController } from './zalo.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Account } from 'src/account/entities/account.entity';
import { RedisModule } from 'src/redis/redis.module';
import { Friend } from 'src/friend/entities/friend.entity';
import { FriendRequest } from 'src/friend-request/entities/friend-request.entity';
import { ConversationModule } from '../conversation/conversation.module';
import { UploadModule } from 'src/upload/upload.module';
import { SentFriendRequest } from 'src/sent-friend-request/entities/sent-friend-request.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { UserModule } from 'src/user/user.module';
import { SocketModule } from '../socket/socket.module';
import { MessageModule } from '../message/message.module';
import { Message } from '../message/entities/message.entity';

@Module({
  imports: [
    JwtModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      Account,
      Friend,
      FriendRequest,
      SentFriendRequest,
      Conversation,
      Message,
    ]),
    RedisModule,
    BullModule.registerQueue({
      name: 'friend-sync',
    }),
    forwardRef(() => ConversationModule),
    forwardRef(() => MessageModule),
    UploadModule,
    UserModule,
    SocketModule,
  ],
  controllers: [ZaloController],
  providers: [ZaloService],
  exports: [ZaloService],
})
export class ZaloModule {}
