import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';
import { User } from '../user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ZaloModule } from 'src/zalo/zalo.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]),
    JwtModule,
    forwardRef(() => ZaloModule),
    forwardRef(() => ConversationModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
