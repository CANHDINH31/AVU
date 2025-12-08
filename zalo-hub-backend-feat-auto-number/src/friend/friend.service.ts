import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Friend } from './entities/friend.entity';
import {
  GetFriendsDto,
  GetFriendsByAccountIdsDto,
} from './dto/get-friends.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async getFriendsByAccountId(accountId: number, query: GetFriendsDto) {
    const { search } = query;

    const queryBuilder = this.friendRepository
      .createQueryBuilder('friend')
      .where('friend.accountId = :accountId', { accountId })
      .orderBy('friend.lastActionTime', 'DESC')
      .addOrderBy('friend.createdAt', 'DESC');

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(friend.displayName LIKE :search OR friend.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const friends = await queryBuilder.getMany();

    return {
      data: friends,
      total: friends.length,
    };
  }

  async getFriendsByAccountIds(
    accountIds: number[],
    query: GetFriendsByAccountIdsDto,
    userId: number,
  ) {
    const { search } = query;
    const queryBuilder = this.friendRepository
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.account', 'account')
      .where('friend.accountId IN (:...accountIds)', { accountIds })
      .andWhere('account.userId = :userId', { userId })
      .orderBy('friend.lastActionTime', 'DESC')
      .addOrderBy('friend.createdAt', 'DESC');

    // Add search functionality
    if (search) {
      queryBuilder.andWhere(
        '(friend.displayName LIKE :search OR friend.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const friends = await queryBuilder.getMany();

    // Transform the data to include account information

    return {
      data: friends,
      total: friends.length,
    };
  }

  async getFriendById(id: number): Promise<Friend> {
    const friend = await this.friendRepository.findOne({ where: { id } });
    if (!friend) {
      throw new NotFoundException(`Friend with ID ${id} not found`);
    }
    return friend;
  }

  async findByUidFrom(uidFrom: string): Promise<(Friend | Account)[]> {
    // Tìm friends theo uidFrom (có thể là userId hoặc userKey)
    const friends = await this.friendRepository.find({
      where: [{ userId: uidFrom }, { userKey: uidFrom }],
    });

    const accounts = await this.accountRepository.find({
      where: {
        userZaloId: uidFrom,
      },
    });

    return [...friends, ...accounts];
  }

  async updateFriend(
    id: number,
    updateFriendDto: UpdateFriendDto,
  ): Promise<Friend> {
    const friend = await this.getFriendById(id);

    // Update only provided fields
    Object.assign(friend, updateFriendDto);

    return this.friendRepository.save(friend);
  }
}
