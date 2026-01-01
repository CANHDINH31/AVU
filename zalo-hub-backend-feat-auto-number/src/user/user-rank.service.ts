import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRank, UserRankName } from './entities/user-rank.entity';
import { CreateUserRankDto } from './dto/create-user-rank.dto';
import { UpdateUserRankDto } from './dto/update-user-rank.dto';

@Injectable()
export class UserRankService {
  constructor(
    @InjectRepository(UserRank)
    private userRankRepository: Repository<UserRank>,
  ) {}

  async create(createUserRankDto: CreateUserRankDto): Promise<UserRank> {
    // Check if name already exists
    const existingRank = await this.userRankRepository.findOne({
      where: { name: createUserRankDto.name },
    });
    if (existingRank) {
      throw new BadRequestException(
        `Rank with name "${createUserRankDto.name}" already exists`,
      );
    }

    const rank = this.userRankRepository.create(createUserRankDto);
    return this.userRankRepository.save(rank);
  }

  async findAll(): Promise<UserRank[]> {
    return this.userRankRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<UserRank> {
    const rank = await this.userRankRepository.findOne({ where: { id } });
    if (!rank) {
      throw new NotFoundException(`Rank with ID ${id} not found`);
    }
    return rank;
  }

  async findByName(name: string): Promise<UserRank | null> {
    return this.userRankRepository.findOne({ where: { name } });
  }

  async findDefaultRank(): Promise<UserRank> {
    // Find "dong" rank as default
    const defaultRank = await this.findByName(UserRankName.DONG);
    if (!defaultRank) {
      throw new NotFoundException('Default rank (dong) not found');
    }
    return defaultRank;
  }

  async update(
    id: number,
    updateUserRankDto: UpdateUserRankDto,
  ): Promise<UserRank> {
    const rank = await this.findOne(id);

    // Check if name is being updated and if it conflicts with existing rank
    if (updateUserRankDto.name && updateUserRankDto.name !== rank.name) {
      const existingRank = await this.userRankRepository.findOne({
        where: { name: updateUserRankDto.name },
      });
      if (existingRank) {
        throw new BadRequestException(
          `Rank with name "${updateUserRankDto.name}" already exists`,
        );
      }
    }

    Object.assign(rank, updateUserRankDto);
    return this.userRankRepository.save(rank);
  }

  async remove(id: number): Promise<void> {
    const rank = await this.findOne(id);

    // Check if any users are using this rank
    const userCount = await this.userRankRepository.manager
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('users', 'user')
      .where('user.rankId = :rankId', { rankId: id })
      .getRawOne();

    if (parseInt(userCount.count) > 0) {
      throw new BadRequestException(
        `Cannot delete rank. There are ${userCount.count} users using this rank.`,
      );
    }

    await this.userRankRepository.remove(rank);
  }

  async getRankStats(): Promise<
    Array<{
      rank: UserRank;
      userCount: number;
    }>
  > {
    const ranks = await this.findAll();
    const stats = await Promise.all(
      ranks.map(async (rank) => {
        const userCount = await this.userRankRepository.manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from('users', 'user')
          .where('user.rankId = :rankId', { rankId: rank.id })
          .getRawOne();

        return {
          rank,
          userCount: parseInt(userCount.count),
        };
      }),
    );

    return stats;
  }
}
