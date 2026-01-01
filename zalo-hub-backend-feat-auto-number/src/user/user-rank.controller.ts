import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserRankService } from './user-rank.service';
import { CreateUserRankDto } from './dto/create-user-rank.dto';
import { UpdateUserRankDto } from './dto/update-user-rank.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserRank } from './entities/user-rank.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserService } from './user.service';

interface AuthenticatedRequest {
  user: {
    sub: number;
    email: string;
    role: string;
  };
}

@ApiTags('User Ranks')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('user-ranks')
export class UserRankController {
  constructor(
    private readonly userRankService: UserRankService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user rank (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The rank has been successfully created.',
    type: UserRank,
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can create ranks.',
  })
  async create(
    @Body() createUserRankDto: CreateUserRankDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Only admin can create ranks
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin can create ranks');
    }
    return this.userRankService.create(createUserRankDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user ranks' })
  @ApiResponse({
    status: 200,
    description: 'List of all user ranks.',
    type: [UserRank],
  })
  async findAll() {
    return this.userRankService.findAll();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user rank statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics for all ranks.',
  })
  async getStats() {
    return this.userRankService.getRankStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user rank by ID' })
  @ApiResponse({
    status: 200,
    description: 'The rank has been found.',
    type: UserRank,
  })
  @ApiResponse({ status: 404, description: 'Rank not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userRankService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user rank (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'The rank has been successfully updated.',
    type: UserRank,
  })
  @ApiResponse({ status: 404, description: 'Rank not found.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can update ranks.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserRankDto: UpdateUserRankDto,
    @Req() req: AuthenticatedRequest,
  ) {
    // Only admin can update ranks
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin can update ranks');
    }
    return this.userRankService.update(id, updateUserRankDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user rank (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'The rank has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Rank not found.' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete rank. Users are using this rank.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. Only admin can delete ranks.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    // Only admin can delete ranks
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin can delete ranks');
    }
    await this.userRankService.remove(id);
  }
}
