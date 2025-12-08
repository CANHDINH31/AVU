import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadPermissions } from './entities/upload-permissions.entity';
import { User } from '../user/entities/user.entity';
import {
  CreateUploadPermissionsDto,
  UpdateUploadPermissionsDto,
  InviteUserDto,
} from './dto/upload-permissions.dto';

@Injectable()
export class UploadPermissionsService {
  constructor(
    @InjectRepository(UploadPermissions)
    private permissionsRepository: Repository<UploadPermissions>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Tạo permissions cho user
  async create(
    createDto: CreateUploadPermissionsDto,
  ): Promise<UploadPermissions> {
    // Kiểm tra user có tồn tại không
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra permissions đã tồn tại chưa
    const existingPermissions = await this.permissionsRepository.findOne({
      where: { userId: createDto.userId },
    });
    if (existingPermissions) {
      throw new ConflictException('Permissions already exist for this user');
    }

    const permissions = this.permissionsRepository.create(createDto);
    return await this.permissionsRepository.save(permissions);
  }

  // Lấy tất cả permissions
  async findAll(): Promise<UploadPermissions[]> {
    return await this.permissionsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Lấy permissions theo user ID
  async findByUserId(userId: number): Promise<UploadPermissions | null> {
    return await this.permissionsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
  }

  // Lấy permissions theo ID
  async findOne(id: number): Promise<UploadPermissions> {
    const permissions = await this.permissionsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!permissions) {
      throw new NotFoundException('Permissions not found');
    }
    return permissions;
  }

  // Cập nhật permissions
  async update(
    id: number,
    updateDto: UpdateUploadPermissionsDto,
  ): Promise<UploadPermissions> {
    await this.permissionsRepository.update(id, updateDto);
    return await this.findOne(id);
  }

  // Xóa permissions
  async remove(id: number): Promise<void> {
    const permissions = await this.findOne(id);
    await this.permissionsRepository.remove(permissions);
  }

  // Mời user mới
  async inviteUser(inviteDto: InviteUserDto): Promise<UploadPermissions> {
    // Tìm user theo email
    const user = await this.userRepository.findOne({
      where: { email: inviteDto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    // Kiểm tra permissions đã tồn tại chưa
    const existingPermissions = await this.permissionsRepository.findOne({
      where: { userId: user.id },
    });
    if (existingPermissions) {
      throw new ConflictException('User already has upload permissions');
    }

    const createDto: CreateUploadPermissionsDto = {
      userId: user.id,
      canRead: inviteDto.canRead || true,
      canCreate: inviteDto.canCreate || false,
      canEdit: inviteDto.canEdit || false,
      canDelete: inviteDto.canDelete || false,
    };

    return await this.create(createDto);
  }

  // Kiểm tra quyền của user
  async checkPermission(
    userId: number,
    permission: 'canRead' | 'canCreate' | 'canEdit' | 'canDelete',
  ): Promise<boolean> {
    const permissions = await this.findByUserId(userId);
    if (!permissions) {
      return false;
    }

    return permissions[permission];
  }

  // Lấy danh sách user có quyền upload
  async getUsersWithPermissions(): Promise<
    Array<UploadPermissions & { user: User }>
  > {
    return await this.permissionsRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
