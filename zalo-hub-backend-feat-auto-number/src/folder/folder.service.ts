import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
  ) {}

  async create(
    name: string,
    folderPath: string,
    description?: string,
  ): Promise<Folder> {
    // Kiểm tra xem path đã tồn tại chưa
    const existingFolder = await this.folderRepository.findOne({
      where: { path: folderPath },
    });

    if (existingFolder) {
      throw new ConflictException('Folder with this path already exists');
    }

    // Tạo thư mục vật lý
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    const fullPath = path.join(uploadDir, folderPath);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    // Tạo record trong database
    const folder = this.folderRepository.create({
      name,
      path: folderPath,
      description,
    });

    return await this.folderRepository.save(folder);
  }

  async findAll(): Promise<Folder[]> {
    return await this.folderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async findByPath(folderPath: string): Promise<Folder> {
    const folder = await this.folderRepository.findOne({
      where: { path: folderPath },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    return folder;
  }

  async update(
    id: number,
    name?: string,
    description?: string,
  ): Promise<Folder> {
    const folder = await this.findOne(id);

    if (name) {
      folder.name = name;
    }

    if (description !== undefined) {
      folder.description = description;
    }

    return await this.folderRepository.save(folder);
  }

  async remove(id: number): Promise<void> {
    const folder = await this.findOne(id);

    // Xóa thư mục vật lý và tất cả nội dung bên trong
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    const fullPath = path.join(uploadDir, folder.path);

    if (fs.existsSync(fullPath)) {
      // Xóa recursive để xóa hết subfolders và files
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    // Xóa record trong database
    await this.folderRepository.remove(folder);
  }

  async rename(id: number, newName: string): Promise<Folder> {
    const folder = await this.findOne(id);

    folder.name = newName;

    return await this.folderRepository.save(folder);
  }

  async getFolderContents(
    folderPath: string,
    sort?: 'az' | 'za' | 'time_desc' | 'time_asc',
    q?: string,
  ): Promise<{
    path: string;
    folders: string[];
    foldersDetailed?: { name: string; mtimeMs: number }[];
    files: { name: string; url: string; size: number; mtimeMs: number }[];
  }> {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads');
    const targetDir = path.join(uploadDir, folderPath);

    // Nếu thư mục không tồn tại, tạo nó và trả về empty result
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      return { path: folderPath, folders: [], files: [] };
    }

    const entries = fs.readdirSync(targetDir);
    const folders: string[] = [];
    const foldersDetailed: { name: string; mtimeMs: number }[] = [];
    const files: {
      name: string;
      url: string;
      size: number;
      mtimeMs: number;
    }[] = [];
    const baseUrl = process.env.BASE_URL || '';

    for (const name of entries) {
      if (q && !name.toLowerCase().includes(q.toLowerCase())) {
        continue;
      }
      const fullPath = path.join(targetDir, name);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        folders.push(name);
        foldersDetailed.push({ name, mtimeMs: stat.mtimeMs });
      } else if (stat.isFile()) {
        const relativePath = path
          .join('uploads', folderPath, name)
          .replace(/\\/g, '/');
        files.push({
          name,
          url: `${baseUrl}/${relativePath}`,
          size: stat.size,
          mtimeMs: stat.mtimeMs,
        });
      }
    }

    // Sorting
    if (sort === 'za') {
      folders.sort((a, b) => b.localeCompare(a));
      foldersDetailed.sort((a, b) => b.name.localeCompare(a.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'time_asc') {
      folders.sort((a, b) => a.localeCompare(b));
      foldersDetailed.sort((a, b) => a.mtimeMs - b.mtimeMs);
      files.sort((a, b) => a.mtimeMs - b.mtimeMs);
    } else if (sort === 'time_desc') {
      folders.sort((a, b) => a.localeCompare(b));
      foldersDetailed.sort((a, b) => b.mtimeMs - a.mtimeMs);
      files.sort((a, b) => b.mtimeMs - a.mtimeMs);
    } else {
      // default A-Z for names; files by name
      folders.sort((a, b) => a.localeCompare(b));
      foldersDetailed.sort((a, b) => a.name.localeCompare(b.name));
      files.sort((a, b) => a.name.localeCompare(b.name));
    }

    return { path: folderPath, folders, foldersDetailed, files };
  }
}
