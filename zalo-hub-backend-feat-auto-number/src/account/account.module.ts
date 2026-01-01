import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './entities/account.entity';
import { User } from '../user/entities/user.entity';
import { UserRank } from '../user/entities/user-rank.entity';
import { Territory } from '../territory/entities/territory.entity';
import { JwtModule } from '@nestjs/jwt';
import { ZaloModule } from '../zalo/zalo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, User, UserRank, Territory]),
    JwtModule,
    ZaloModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
