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
} from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiBearerAuth('access-token')
@Controller('reaction')
@UseGuards(AuthGuard)
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  create(@Body() createReactionDto: CreateReactionDto) {
    return this.reactionService.create(createReactionDto);
  }

  @Get()
  findAll() {
    return this.reactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reactionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReactionDto: UpdateReactionDto,
  ) {
    return this.reactionService.update(id, updateReactionDto);
  }

  @Patch('conversation/:conversationId/read')
  markConversationAsRead(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    return this.reactionService.markConversationAsRead(conversationId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reactionService.remove(id);
  }
}
