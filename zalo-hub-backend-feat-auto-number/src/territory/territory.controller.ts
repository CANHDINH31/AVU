import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Put,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TerritoryService } from './territory.service';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UserService } from '../user/user.service';
import { GetTerritoriesDto } from './dto/get-territories.dto';
import { PaginatedTerritoriesDto } from './dto/paginated-territories.dto';

@ApiTags('Territory')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('territories')
export class TerritoryController {
  constructor(
    private readonly territoryService: TerritoryService,
    private readonly userService: UserService,
  ) {}

  private async ensureAdmin(req: any) {
    const isAdmin = await this.userService.isAdmin(req.user.sub);
    if (!isAdmin) {
      throw new ForbiddenException('Only admin can manage territories');
    }
  }

  @Get()
  @ApiOperation({ summary: 'List territories (Admin only)' })
  async findAll(@Req() req) {
    await this.ensureAdmin(req);
    return this.territoryService.findAll();
  }

  @Get('paginated')
  @ApiOperation({
    summary: 'List territories with pagination and search (Admin only)',
  })
  @ApiResponse({ status: 200, type: PaginatedTerritoriesDto })
  async findPaginated(@Req() req, @Query() query: GetTerritoriesDto) {
    await this.ensureAdmin(req);
    return this.territoryService.findWithPagination(
      query.page,
      query.limit,
      query.search,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get territory statistics (Admin only)' })
  async getStats(@Req() req) {
    await this.ensureAdmin(req);
    return this.territoryService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get territory by id (Admin only)' })
  async findOne(@Req() req, @Param('id', ParseIntPipe) id: number) {
    await this.ensureAdmin(req);
    return this.territoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create territory (Admin only)' })
  async create(@Req() req, @Body() dto: CreateTerritoryDto) {
    await this.ensureAdmin(req);
    return this.territoryService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update territory (Admin only)' })
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTerritoryDto,
  ) {
    await this.ensureAdmin(req);
    return this.territoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete territory (Admin only)' })
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    await this.ensureAdmin(req);
    return this.territoryService.remove(id);
  }
}
