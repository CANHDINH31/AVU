import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Territory } from './entities/territory.entity';
import { TerritoryService } from './territory.service';
import { TerritoryController } from './territory.controller';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Territory, User]), UserModule, JwtModule],
  controllers: [TerritoryController],
  providers: [TerritoryService],
  exports: [TerritoryService],
})
export class TerritoryModule {}
