import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { UploadPermissionsService } from './upload-permissions.service';
import { UploadPermissionsController } from './upload-permissions.controller';
import { UploadPermissions } from './entities/upload-permissions.entity';
import { User } from '../user/entities/user.entity';
import { FolderModule } from '../folder/folder.module';

@Module({
  imports: [
    MulterModule.register({}),
    FolderModule,
    TypeOrmModule.forFeature([UploadPermissions, User]),
  ],
  controllers: [UploadController, UploadPermissionsController],
  providers: [UploadService, UploadPermissionsService],
  exports: [UploadService, UploadPermissionsService],
})
export class UploadModule {}
