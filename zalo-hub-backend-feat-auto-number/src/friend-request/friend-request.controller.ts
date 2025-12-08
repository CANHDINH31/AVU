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
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import {
  AccountIdsDto,
  GetFriendRequestsByAccountIdsDto,
} from './dto/get-friend-request.dto';
import { FriendRequestsListResponseDto } from './dto/friend-request-response';

@Controller('friend-request')
@UseGuards(AuthGuard)
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post('accounts')
  async getFriendsByAccountIds(
    @Body() body: AccountIdsDto,
    @Query() query: GetFriendRequestsByAccountIdsDto,
    @Req() req: any,
  ): Promise<FriendRequestsListResponseDto> {
    return this.friendRequestService.getFriendRequestsByAccountIds(
      body.accountIds,
      query,
      req.user.sub,
    );
  }

  @Post('sent-accounts')
  async getSentFriendRequestsByAccountIds(
    @Body() body: AccountIdsDto,
    @Query() query: GetFriendRequestsByAccountIdsDto,
    @Req() req: any,
  ): Promise<FriendRequestsListResponseDto> {
    return this.friendRequestService.getSentFriendRequestsByAccountIds(
      body.accountIds,
      query,
      req.user.sub,
    );
  }

  @Post()
  create(@Body() createFriendRequestDto: CreateFriendRequestDto) {
    return this.friendRequestService.create(createFriendRequestDto);
  }

  @Get()
  findAll() {
    return this.friendRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.friendRequestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
  ) {
    return this.friendRequestService.update(+id, updateFriendRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.friendRequestService.remove(+id);
  }
}
