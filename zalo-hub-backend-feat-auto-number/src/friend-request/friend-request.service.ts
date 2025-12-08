import { Injectable } from '@nestjs/common';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './entities/friend-request.entity';
import { GetFriendRequestsByAccountIdsDto } from './dto/get-friend-request.dto';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectRepository(FriendRequest)
    private readonly friendRequestRepository: Repository<FriendRequest>,
  ) {}

  async getFriendRequestsByAccountIds(
    accountIds: number[],
    query: GetFriendRequestsByAccountIdsDto,
    userId: number,
  ) {
    const { search } = query;
    const queryBuilder = this.friendRequestRepository
      .createQueryBuilder('friend_request')
      .leftJoinAndSelect('friend_request.account', 'account')
      .where('friend_request.accountId IN (:...accountIds)', { accountIds })
      .andWhere('account.userId = :userId', { userId })
      .addOrderBy('friend_request.createdAt', 'DESC');

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(friend_request.displayName LIKE :search OR friend_request.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const friendRequests = await queryBuilder.getMany();

    return {
      data: friendRequests,
      total: friendRequests.length,
    };
  }

  async getSentFriendRequestsByAccountIds(
    accountIds: number[],
    query: GetFriendRequestsByAccountIdsDto,
    userId: number,
  ) {
    const { search } = query;
    const queryBuilder = this.friendRequestRepository
      .createQueryBuilder('friend_request')
      .leftJoinAndSelect('friend_request.account', 'account')
      .where('friend_request.accountId IN (:...accountIds)', { accountIds })
      .andWhere('account.userId = :userId', { userId })
      .andWhere('friend_request.status = :status', { status: 'pending' })
      .addOrderBy('friend_request.createdAt', 'DESC');

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(friend_request.displayName LIKE :search OR friend_request.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const sentFriendRequests = await queryBuilder.getMany();

    return {
      data: sentFriendRequests,
      total: sentFriendRequests.length,
    };
  }

  create(createFriendRequestDto: CreateFriendRequestDto) {
    return 'This action adds a new friendRequest';
  }

  findAll() {
    return `This action returns all friendRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friendRequest`;
  }

  update(id: number, updateFriendRequestDto: UpdateFriendRequestDto) {
    return `This action updates a #${id} friendRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} friendRequest`;
  }
}
