import {
  Controller,
  Post,
  Get,
  UploadedFiles,
  UseInterceptors,
  Param,
  Body,
  Query,
  Put,
  Delete,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { FolderService } from '../folder/folder.service';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly folderService: FolderService,
  ) {}

  // Admin tạo thư mục
  @Post('folders')
  async createFolder(
    @Body('name') name: string,
    @Body('path') folderPath?: string,
    @Body('description') description?: string,
  ) {
    // Nếu không có path, tự động generate từ name
    const finalPath = folderPath || this.generatePathFromName(name);
    return await this.uploadService.createFolder(name, finalPath, description);
  }

  // Helper method để generate path từ name
  private generatePathFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
      .replace(/\s+/g, '-') // Thay space bằng dash
      .replace(/-+/g, '-') // Loại bỏ dash trùng lặp
      .trim();
  }

  // Upload nhiều file vào một thư mục
  @Post('files/:folder')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFilesToFolder(
    @Param('folder') folder: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const urls = files.map((f) => this.uploadService.uploadToSubdir(f, folder));
    return { urls };
  }

  // Upload với đường dẫn có thể chứa dấu '/': dùng query param 'path'
  @Post('files')
  @UseInterceptors(FilesInterceptor('files'))
  uploadFilesWithPath(
    @Query('path') path?: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const safePath = (path || '').replace(/[^a-zA-Z0-9-_/]/g, '');
    const urls = (files || []).map((f) =>
      this.uploadService.uploadToSubdir(f, safePath),
    );
    return { urls };
  }

  // Liệt kê thư mục và file dưới uploads (path optional)
  @Get('list')
  async list(
    @Query('path') path?: string,
    @Query('sort') sort?: 'az' | 'za' | 'time_desc' | 'time_asc',
    @Query('q') q?: string,
    @Res() res?: Response,
  ) {
    const result = await this.uploadService.list(path || '', sort, q);

    // Disable caching để tránh 304 Not Modified
    if (res) {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      });
    }

    return res ? res.json(result) : result;
  }

  // Lấy danh sách folders từ database
  @Get('folders')
  async getFolders() {
    return await this.folderService.findAll();
  }

  // Rename folder
  @Put('folders/:id/rename')
  async renameFolder(@Param('id') id: string, @Body('name') newName: string) {
    const folderId = parseInt(id);
    return await this.folderService.rename(folderId, newName);
  }

  // Delete folder
  @Delete('folders/:id')
  async deleteFolder(@Param('id') id: string) {
    const folderId = parseInt(id);
    await this.folderService.remove(folderId);
    return { message: 'Folder deleted successfully' };
  }

  // File operations
  @Delete('files')
  async deleteFile(@Query('path') path: string, @Query('name') name: string) {
    return this.uploadService.deleteFile(path || '', name);
  }

  @Put('files/rename')
  async renameFile(
    @Query('path') path: string,
    @Query('old') oldName: string,
    @Query('new') newName: string,
  ) {
    return this.uploadService.renameFile(path || '', oldName, newName);
  }
}
