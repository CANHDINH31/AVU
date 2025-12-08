import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { Reaction } from './entities/reaction.entity';
import { User } from '../user/entities/user.entity';
import { Message } from '../message/entities/message.entity';
import { JwtModule } from '@nestjs/jwt';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction, User, Message]),
    JwtModule,
    forwardRef(() => MessageModule),
  ],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
