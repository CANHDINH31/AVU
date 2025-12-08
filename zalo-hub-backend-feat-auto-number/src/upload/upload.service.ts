import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { FolderService } from '../folder/folder.service';

@Injectable()
export class UploadService {
  constructor(private readonly folderService: FolderService) {}
  // Lưu file vào thư mục uploads/videos và trả về public URL
  uploadLocal(file: Express.Multer.File): string {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    // Thêm timestamp vào tên file để tránh trùng lặp
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueFileName = `${baseName}_${timestamp}${ext}`;
    const destPath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(destPath, file.buffer);
    // Trả về public URL
    const baseUrl = process.env.BASE_URL;
    return `${baseUrl}/uploads/videos/${uniqueFileName}`;
  }

  // Lưu file vào thư mục uploads/[subdir] và trả về public URL (dùng cho admin theo thư mục)
  uploadToSubdir(file: Express.Multer.File, subdir: string = 'files'): string {
    const safeSubdir = subdir.replace(/[^a-zA-Z0-9-_\/]/g, '');
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', safeSubdir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueFileName = `${baseName}_${timestamp}${ext}`;
    const destPath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(destPath, file.buffer);
    const baseUrl = process.env.BASE_URL || '';
    return `${baseUrl}/uploads/${safeSubdir}/${uniqueFileName}`;
  }

  // Tạo thư mục con trong uploads (dùng cho admin) - sử dụng FolderService
  async createFolder(
    folderName: string,
    folderPath: string,
    description?: string,
  ) {
    return await this.folderService.create(folderName, folderPath, description);
  }

  // Liệt kê thư mục và file trong uploads/[path] - sử dụng FolderService
  async list(
    pathInput: string = '',
    sort?: 'az' | 'za' | 'time_desc' | 'time_asc',
    q?: string,
  ) {
    return await this.folderService.getFolderContents(pathInput, sort, q);
  }

  // Xóa file trong uploads/[path]
  deleteFile(pathInput: string, filename: string) {
    const safePath = (pathInput || '').replace(/[^a-zA-Z0-9-_\/]/g, '');
    const baseDir = path.join(__dirname, '..', '..', 'uploads');
    const target = path.join(baseDir, safePath, filename);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
    }
    return { deleted: true };
  }

  // Đổi tên file trong uploads/[path]
  renameFile(pathInput: string, oldName: string, newName: string) {
    const safePath = (pathInput || '').replace(/[^a-zA-Z0-9-_\/]/g, '');
    const baseDir = path.join(__dirname, '..', '..', 'uploads');
    const src = path.join(baseDir, safePath, oldName);
    const dest = path.join(baseDir, safePath, newName);
    if (fs.existsSync(src)) {
      fs.renameSync(src, dest);
    }
    return { renamed: true };
  }
}
