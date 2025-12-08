import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UploadPermissionsService } from './upload-permissions.service';
import {
  CreateUploadPermissionsDto,
  UpdateUploadPermissionsDto,
  InviteUserDto,
} from './dto/upload-permissions.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('upload-permissions')
@UseGuards(JwtAuthGuard)
export class UploadPermissionsController {
  constructor(private readonly permissionsService: UploadPermissionsService) {}

  // Tạo permissions mới
  @Post()
  async create(@Body() createDto: CreateUploadPermissionsDto) {
    return await this.permissionsService.create(createDto);
  }

  // Lấy tất cả permissions
  @Get()
  async findAll() {
    return await this.permissionsService.findAll();
  }

  // Lấy permissions theo ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.permissionsService.findOne(id);
  }

  // Lấy permissions của user hiện tại
  @Get('my/permissions')
  async getMyPermissions(@Query('userId', ParseIntPipe) userId: number) {
    return await this.permissionsService.findByUserId(userId);
  }

  // Cập nhật permissions
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateUploadPermissionsDto,
  ) {
    return await this.permissionsService.update(id, updateDto);
  }

  // Xóa permissions
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.permissionsService.remove(id);
    return { message: 'Permissions deleted successfully' };
  }

  // Mời user mới
  @Post('invite')
  async inviteUser(@Body() inviteDto: InviteUserDto) {
    return await this.permissionsService.inviteUser(inviteDto);
  }

  // Lấy danh sách user có quyền upload
  @Get('users/with-permissions')
  async getUsersWithPermissions() {
    return await this.permissionsService.getUsersWithPermissions();
  }

  // Kiểm tra quyền của user
  @Get('check/:userId')
  async checkPermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('permission')
    permission: 'canRead' | 'canCreate' | 'canEdit' | 'canDelete',
  ) {
    const hasPermission = await this.permissionsService.checkPermission(
      userId,
      permission,
    );
    return { hasPermission };
  }
}
