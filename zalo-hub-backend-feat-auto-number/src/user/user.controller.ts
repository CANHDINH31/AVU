import {
  Controller,
  Put,
  Body,
  Param,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { User, UserRole } from './entities/user.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { SearchUserDto } from './dto/search-user.dto';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @ApiOperation({
    summary:
      'Search users by name/email and optional role with role-based access control',
    description:
      'Admin: can search all users, Manager: can search users in managed territories, User: can only search themselves',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in both name and email',
  })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiResponse({ status: 200, type: [User] })
  async searchUsers(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('role') role?: string,
    @Query('active') active?: string,
  ): Promise<User[]> {
    const safeRole: UserRole | undefined =
      role === UserRole.ADMIN ||
      role === UserRole.MANAGER ||
      role === UserRole.USER
        ? (role as UserRole)
        : undefined;
    const activeNum: 0 | 1 | undefined =
      active === '1' ? 1 : active === '0' ? 0 : undefined;

    const dto: SearchUserDto = {
      search,
      name,
      email,
      role: safeRole,
      active: activeNum,
    };
    const users: User[] = await this.userService.searchUsers(dto, req.user.sub);
    return users;
  }

  @Get('managers')
  @ApiOperation({ summary: 'List manager users' })
  @ApiQuery({ name: 'search', required: false, type: String })
  async listManagers(@Query('search') search?: string) {
    return this.userService.findByRole(UserRole.MANAGER, search);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
    type: User,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Invalid input.',
  })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  @Put(':id/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Password has been successfully changed.',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Current password is incorrect.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const updatedUser = await this.userService.changePassword(
      id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
    return updatedUser;
  }
}
