import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { StickerService } from './sticker.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('sticker')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('sticker')
export class StickerController {
  constructor(private readonly stickerService: StickerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stickers' })
  @ApiResponse({ status: 200, description: 'Return all stickers' })
  findAll() {
    return this.stickerService.findAll();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get sticker categories' })
  @ApiResponse({ status: 200, description: 'Return sticker categories' })
  getCategories() {
    return this.stickerService.getCategories();
  }

  @Get('category/:cateId')
  @ApiOperation({ summary: 'Get stickers by category' })
  @ApiResponse({ status: 200, description: 'Return stickers by category' })
  findByCategory(@Param('cateId', ParseIntPipe) cateId: number) {
    return this.stickerService.findByCategory(cateId);
  }

  @Get('search/category/:categoryId')
  @ApiOperation({ summary: 'Search stickers by category ID (like search)' })
  @ApiResponse({
    status: 200,
    description: 'Return stickers matching category ID pattern',
  })
  searchByCategoryId(@Param('categoryId') categoryId: string) {
    return this.stickerService.searchByCategoryId(categoryId);
  }

  @Get('search/sticker/:stickerId')
  @ApiOperation({ summary: 'Search stickers by sticker ID (like search)' })
  @ApiResponse({
    status: 200,
    description: 'Return stickers matching sticker ID pattern',
  })
  searchByStickerId(@Param('stickerId') stickerId: string) {
    return this.stickerService.searchByStickerId(stickerId);
  }
}
