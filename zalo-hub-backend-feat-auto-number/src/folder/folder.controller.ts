import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  RenameFolderDto,
} from './dto/folder.dto';

@Controller('folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  async create(@Body() createFolderDto: CreateFolderDto) {
    return await this.folderService.create(
      createFolderDto.name,
      createFolderDto.path,
      createFolderDto.description,
    );
  }

  @Get()
  async findAll() {
    return await this.folderService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.folderService.findOne(id);
  }

  @Get('path/:path')
  async findByPath(@Param('path') path: string) {
    return await this.folderService.findByPath(path);
  }

  @Get(':id/contents')
  async getContents(@Param('id', ParseIntPipe) id: number) {
    const folder = await this.folderService.findOne(id);
    return await this.folderService.getFolderContents(folder.path);
  }

  @Get('path/:path/contents')
  async getContentsByPath(@Param('path') path: string) {
    return await this.folderService.getFolderContents(path);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return await this.folderService.update(
      id,
      updateFolderDto.name,
      updateFolderDto.description,
    );
  }

  @Put(':id/rename')
  async rename(
    @Param('id', ParseIntPipe) id: number,
    @Body() renameFolderDto: RenameFolderDto,
  ) {
    return await this.folderService.rename(id, renameFolderDto.name);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.folderService.remove(id);
  }
}
