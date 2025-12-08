import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  GetFriendsDto,
  GetFriendsByAccountIdsDto,
  AccountIdsDto,
} from './dto/get-friends.dto';
import {
  FriendResponseDto,
  FriendsListResponseDto,
} from './dto/friend-response.dto';
import { FriendService } from './friend.service';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('friend')
@Controller('friend')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('account/:accountId')
  @ApiOperation({ summary: 'Get all friends by account ID' })
  @ApiParam({ name: 'accountId', description: 'Account ID', type: 'number' })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by display name or username',
  })
  @ApiResponse({
    status: 200,
    description: 'Friends list retrieved successfully',
    type: FriendsListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Account not found' })
  async getFriendsByAccountId(
    @Param('accountId') accountId: number,
    @Query() query: GetFriendsDto,
  ): Promise<FriendsListResponseDto> {
    return this.friendService.getFriendsByAccountId(accountId, query);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Get all friends by multiple account IDs' })
  @ApiBody({
    type: AccountIdsDto,
    description: 'Array of account IDs to get friends for',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: 'string',
    description: 'Search by display name or username',
  })
  @ApiResponse({
    status: 200,
    description: 'Friends list retrieved successfully',
    type: FriendsListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid account IDs' })
  async getFriendsByAccountIds(
    @Body() body: AccountIdsDto,
    @Query() query: GetFriendsByAccountIdsDto,
    @Req() req: any,
  ): Promise<FriendsListResponseDto> {
    return this.friendService.getFriendsByAccountIds(
      body.accountIds,
      query,
      req.user.sub,
    );
  }

  @Get('find-uidfrom/:uidFrom')
  @ApiOperation({ summary: 'Get friends by uidFrom' })
  @ApiParam({ name: 'uidFrom', description: 'UID From', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Friends retrieved successfully',
    type: [FriendResponseDto],
  })
  @ApiResponse({ status: 404, description: 'No friends found' })
  async getFriendsByUidFrom(
    @Param('uidFrom') uidFrom: string,
  ): Promise<(FriendResponseDto | any)[]> {
    return this.friendService.findByUidFrom(uidFrom);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get friend by ID' })
  @ApiParam({ name: 'id', description: 'Friend ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Friend retrieved successfully',
    type: FriendResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Friend not found' })
  async getFriendById(@Param('id') id: number): Promise<FriendResponseDto> {
    return this.friendService.getFriendById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update friend information' })
  @ApiParam({ name: 'id', description: 'Friend ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Friend updated successfully',
    type: FriendResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Friend not found' })
  async updateFriend(
    @Param('id') id: number,
    @Body() updateFriendDto: UpdateFriendDto,
  ): Promise<FriendResponseDto> {
    return this.friendService.updateFriend(id, updateFriendDto);
  }
}
