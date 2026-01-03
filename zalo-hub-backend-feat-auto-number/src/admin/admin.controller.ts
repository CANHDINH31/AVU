import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserRankForUserDto } from './dto/update-user-rank.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { AdminChangePasswordDto } from './dto/change-password.dto';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated users.',
    type: PaginatedUsersDto,
  })
  async getAllUsers(@Req() req, @Query() query: GetUsersDto) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    return this.userService.findWithPagination(
      query.page,
      query.limit,
      query.search,
      query.active,
      query.role,
      query.rankId,
    );
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Get users statistics (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return user statistics.',
  })
  async getUsersStats(@Req() req) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    return this.userService.getStats();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Return user details.',
    type: User,
  })
  async getUserById(@Req() req, @Param('id', ParseIntPipe) id: number) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: User,
  })
  async createUser(@Req() req, @Body() createUserDto: CreateUserDto) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    return this.userService.create(createUserDto);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully.',
    type: User,
  })
  async updateUserRole(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    return this.userService.updateRole(id, updateUserRoleDto.role);
  }

  @Put('users/:id/rank')
  @ApiOperation({ summary: 'Update user rank (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User rank updated successfully.',
    type: User,
  })
  async updateUserRank(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRankDto: UpdateUserRankForUserDto,
  ) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    const user = await this.userService.updateRank(
      id,
      updateUserRankDto.rankId,
    );
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Put('users/:id/activate')
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully.',
    type: User,
  })
  async activateUser(@Req() req, @Param('id', ParseIntPipe) id: number) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    const user = await this.userService.activateUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Put('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully.',
    type: User,
  })
  async deactivateUser(@Req() req, @Param('id', ParseIntPipe) id: number) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    const user = await this.userService.deactivateUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Put('users/:id/change-password')
  @ApiOperation({ summary: 'Change user password (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Password has been successfully changed.',
    type: User,
  })
  async changePasswordByAdmin(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: AdminChangePasswordDto,
  ) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    const user = await this.userService.changePasswordByAdmin(
      id,
      changePasswordDto.newPassword,
    );
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  async deleteUser(@Req() req, @Param('id', ParseIntPipe) id: number) {
    // Check if user is admin
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin users can access this endpoint');
    }

    return this.userService.remove(id);
  }
}
