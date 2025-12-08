import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { Territory } from '../territory/entities/territory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Territory]), JwtModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
