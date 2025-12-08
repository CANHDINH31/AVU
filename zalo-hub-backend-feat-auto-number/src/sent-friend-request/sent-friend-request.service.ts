import { Injectable } from '@nestjs/common';
import { CreateSentFriendRequestDto } from './dto/create-sent-friend-request.dto';
import { UpdateSentFriendRequestDto } from './dto/update-sent-friend-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SentFriendRequest } from './entities/sent-friend-request.entity';
import { Repository } from 'typeorm';
import { GetSentFriendRequestsByAccountIdsDto } from './dto/get-friend-request.dto';

@Injectable()
export class SentFriendRequestService {
  constructor(
    @InjectRepository(SentFriendRequest)
    private readonly sentFriendRequestRepository: Repository<SentFriendRequest>,
  ) {}

  async getSentFriendRequestsByAccountIds(
    accountIds: number[],
    query: GetSentFriendRequestsByAccountIdsDto,
    userId: number,
  ) {
    const { search } = query;
    const queryBuilder = this.sentFriendRequestRepository
      .createQueryBuilder('sent_friend_request')
      .leftJoinAndSelect('sent_friend_request.account', 'account')
      .where('sent_friend_request.accountId IN (:...accountIds)', {
        accountIds,
      })
      .andWhere('account.userId = :userId', { userId })
      .addOrderBy('sent_friend_request.createdAt', 'DESC');

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(sent_friend_request.displayName LIKE :search OR sent_friend_request.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const sentFriendRequests = await queryBuilder.getMany();

    return {
      data: sentFriendRequests,
      total: sentFriendRequests.length,
    };
  }

  create(createSentFriendRequestDto: CreateSentFriendRequestDto) {
    return 'This action adds a new sentFriendRequest';
  }

  findAll() {
    return `This action returns all sentFriendRequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sentFriendRequest`;
  }

  update(id: number, updateSentFriendRequestDto: UpdateSentFriendRequestDto) {
    return `This action updates a #${id} sentFriendRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} sentFriendRequest`;
  }
}
