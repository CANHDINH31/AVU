import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { SentFriendRequestService } from './sent-friend-request.service';
import { CreateSentFriendRequestDto } from './dto/create-sent-friend-request.dto';
import { UpdateSentFriendRequestDto } from './dto/update-sent-friend-request.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  AccountIdsDto,
  GetSentFriendRequestsByAccountIdsDto,
} from './dto/get-friend-request.dto';
import { SentFriendRequestsListResponseDto } from './dto/sent-friend-request-response';

@Controller('sent-friend-request')
@Controller('friend-request')
@UseGuards(AuthGuard)
export class SentFriendRequestController {
  constructor(
    private readonly sentFriendRequestService: SentFriendRequestService,
  ) {}

  @Post('accounts')
  async getSentFriendsByAccountIds(
    @Body() body: AccountIdsDto,
    @Query() query: GetSentFriendRequestsByAccountIdsDto,
    @Req() req: any,
  ): Promise<SentFriendRequestsListResponseDto> {
    return this.sentFriendRequestService.getSentFriendRequestsByAccountIds(
      body.accountIds,
      query,
      req.user.sub,
    );
  }

  @Post()
  create(@Body() createSentFriendRequestDto: CreateSentFriendRequestDto) {
    return this.sentFriendRequestService.create(createSentFriendRequestDto);
  }

  @Get()
  findAll() {
    return this.sentFriendRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sentFriendRequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSentFriendRequestDto: UpdateSentFriendRequestDto,
  ) {
    return this.sentFriendRequestService.update(
      +id,
      updateSentFriendRequestDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sentFriendRequestService.remove(+id);
  }
}
