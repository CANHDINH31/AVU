import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto';
import { Account } from './entities/account.entity';
import { User } from '../user/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('Account')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({
    status: 201,
    description: 'The account has been successfully created.',
    type: Account,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    return this.accountService.create(req.user.sub, createAccountDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all accounts based on user role and permissions',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return accounts based on user role: Admin sees all, Manager sees their own + territory users, User sees only their own.',
    type: [Account],
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
  ): Promise<Account[]> {
    const filterUserId = userId ? parseInt(userId, 10) : undefined;
    return this.accountService.findAllWithRoleBasedAccess(
      req.user.sub,
      search,
      filterUserId,
    );
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get accounts based on current user role and permissions',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return accounts based on user role: Admin sees all, Manager sees their own + territory users, User sees only their own.',
    type: [Account],
  })
  findAllByUser(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('userId') userId?: string,
  ): Promise<Account[]> {
    const filterUserId = userId ? parseInt(userId, 10) : undefined;
    return this.accountService.findAllWithRoleBasedAccess(
      req.user.sub,
      search,
      filterUserId,
    );
  }

  @Get('accessible-users')
  @ApiOperation({
    summary: 'Get accessible user IDs based on current user role',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return user IDs that current user can access based on their role.',
  })
  getAccessibleUsers(@Req() req: AuthenticatedRequest): Promise<number[]> {
    return this.accountService.getAccessibleUserIds(req.user.sub);
  }

  @Get('filterable-users')
  @ApiOperation({
    summary: 'Get list of users that can be used for filtering accounts',
  })
  @ApiResponse({
    status: 200,
    description: 'Return list of users with their basic info for filtering.',
  })
  getFilterableUsers(@Req() req: AuthenticatedRequest): Promise<User[]> {
    return this.accountService.getFilterableUsers(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by id' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the account.',
    type: Account,
  })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Account> {
    return this.accountService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'The account has been successfully updated.',
    type: Account,
  })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    return this.accountService.update(id, updateAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'The account has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({
    status: 403,
    description: 'You do not have permission to delete this account.',
  })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.accountService.remove(id, req.user.sub);
  }

  @Patch(':id/settings')
  @ApiOperation({ summary: 'Update account auto settings' })
  @ApiParam({ name: 'id', description: 'Account ID' })
  @ApiResponse({
    status: 200,
    description: 'The account settings have been successfully updated.',
    type: Account,
  })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  updateSettings(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSettingsDto: UpdateAccountSettingsDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Account> {
    return this.accountService.updateSettings(
      id,
      updateSettingsDto,
      req.user.sub,
    );
  }
}
