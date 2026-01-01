import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserRankService } from './user-rank.service';
import { User } from './entities/user.entity';
import { UserRank } from './entities/user-rank.entity';
import { UserController } from './user.controller';
import { UserRankController } from './user-rank.controller';
import { JwtModule } from '@nestjs/jwt';
import { Territory } from '../territory/entities/territory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRank, Territory]), JwtModule],
  controllers: [UserController, UserRankController],
  providers: [UserService, UserRankService],
  exports: [UserService, UserRankService],
})
export class UserModule {}
