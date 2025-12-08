import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from './entities/conversation.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ConversationAccountIdsDto } from './dto/conversation-account-ids.dto';
import { ConversationFriendIdDto } from './dto/conversation-friend-id.dto';

@ApiTags('conversation')
@ApiBearerAuth('access-token')
@Controller('conversation')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(@Body() data: Partial<Conversation>) {
    return this.conversationService.create(data);
  }

  @Get()
  findAll() {
    return this.conversationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(Number(id));
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get conversation with all messages' })
  @ApiResponse({
    status: 200,
    description: 'Conversation with messages retrieved successfully',
    type: Conversation,
  })
  findOneWithMessages(@Param('id') id: string) {
    return this.conversationService.findOneWithMessages(Number(id));
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Conversation>) {
    return this.conversationService.update(Number(id), data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(Number(id));
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Pin or unpin a conversation' })
  @ApiResponse({
    status: 200,
    description: 'Conversation pin status updated successfully',
    type: Conversation,
  })
  async togglePin(@Param('id') id: string) {
    return this.conversationService.togglePin(Number(id));
  }

  @Post('by-friend-and-account')
  @ApiOperation({ summary: 'Get conversation by friend ID and account ID' })
  @ApiBody({
    type: ConversationFriendIdDto,
    description: 'Friend ID and account ID to find the conversation with',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversation retrieved successfully',
    type: Conversation,
  })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async getConversationByFriendIdAndAccountId(
    @Body() body: ConversationFriendIdDto,
  ): Promise<Conversation> {
    return this.conversationService.getConversationByFriendIdAndAccountId(
      body.friendId,
      body.accountId,
    );
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Get all conversations by multiple account IDs' })
  @ApiBody({
    type: ConversationAccountIdsDto,
    description: 'Array of account IDs to get conversations for',
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations list retrieved successfully',
    type: [Conversation],
  })
  @ApiResponse({ status: 400, description: 'Invalid account IDs' })
  async getConversationsByAccountIds(
    @Body() body: ConversationAccountIdsDto,
    @Req() req: any,
  ): Promise<Conversation[]> {
    return this.conversationService.getConversationsByAccountIds(
      body.accountIds,
      req.user.sub,
    );
  }
}
