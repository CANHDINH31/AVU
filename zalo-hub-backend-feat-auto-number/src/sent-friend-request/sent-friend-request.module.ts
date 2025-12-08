import { Module } from '@nestjs/common';
import { SentFriendRequestService } from './sent-friend-request.service';
import { SentFriendRequestController } from './sent-friend-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SentFriendRequest } from './entities/sent-friend-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SentFriendRequest]), JwtModule],
  controllers: [SentFriendRequestController],
  providers: [SentFriendRequestService],
})
export class SentFriendRequestModule {}
