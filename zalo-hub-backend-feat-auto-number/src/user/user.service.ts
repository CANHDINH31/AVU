import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { UserRank, UserRankName } from './entities/user-rank.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SearchUserDto } from './dto/search-user.dto';
import { Territory } from '../territory/entities/territory.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Territory)
    private territoryRepository: Repository<Territory>,
    @InjectRepository(UserRank)
    private userRankRepository: Repository<UserRank>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Check if email already exists
    if (userData.email) {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Set default rank (dong) if rankId is not provided or invalid
    if (!userData.rankId) {
      const defaultRank = await this.userRankRepository.findOne({
        where: { name: UserRankName.DONG },
      });
      if (defaultRank) {
        userData.rankId = defaultRank.id;
      }
    } else {
      // Verify that the provided rankId exists
      const rank = await this.userRankRepository.findOne({
        where: { id: userData.rankId },
      });
      if (!rank) {
        // If rank doesn't exist, use default rank
        const defaultRank = await this.userRankRepository.findOne({
          where: { name: UserRankName.DONG },
        });
        if (defaultRank) {
          userData.rankId = defaultRank.id;
        }
      }
    }

    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['rank'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async findByRole(role: UserRole, search?: string): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role });

    if (search) {
      qb.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    return qb.orderBy('user.name', 'ASC').getMany();
  }

  async updateRole(id: number, role: UserRole): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    user.role = role;
    return await this.userRepository.save(user);
  }

  async updateRank(id: number, rankId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    // Verify that the provided rankId exists
    const rank = await this.userRankRepository.findOne({
      where: { id: rankId },
    });
    if (!rank) {
      throw new BadRequestException(`Rank with ID ${rankId} not found`);
    }

    user.rankId = rankId;
    return await this.userRepository.save(user);
  }

  async isAdmin(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.role === UserRole.ADMIN;
  }

  async isManager(userId: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * Get user IDs that a user can access based on their role
   */
  async getAccessibleUserIds(userId: number): Promise<number[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['managedTerritories'],
    });

    if (!user) {
      return [];
    }

    switch (user.role) {
      case UserRole.ADMIN: {
        // Admin can access all users
        const allUsers = await this.userRepository.find({
          select: ['id'],
        });
        return allUsers.map((u) => u.id);
      }

      case UserRole.MANAGER: {
        // Manager can access users in their managed territories
        const managedTerritories = await this.territoryRepository.find({
          where: { manager: { id: userId } },
          relations: ['users'],
        });

        const accessibleIds = [userId]; // Include themselves
        for (const territory of managedTerritories) {
          const territoryUserIds = territory.users.map((user) => user.id);
          accessibleIds.push(...territoryUserIds);
        }

        return [...new Set(accessibleIds)]; // Remove duplicates
      }

      case UserRole.USER:
      default:
        // User can only access themselves
        return [userId];
    }
  }

  async searchUsers(
    params: SearchUserDto,
    currentUserId: number,
  ): Promise<User[]> {
    const { search, name, email, role, active, all } = params;

    // Get accessible user IDs based on current user's role
    const accessibleUserIds = await this.getAccessibleUserIds(currentUserId);

    const qb = this.userRepository.createQueryBuilder('user');

    // Apply role-based filtering
    qb.where('user.id IN (:...accessibleUserIds)', { accessibleUserIds });

    // If 'all' parameter is set to 1, return all accessible users without additional filtering
    if (all === 1) {
      return qb.orderBy('user.name', 'ASC').getMany();
    }

    const whereClauses: string[] = [];
    const variables: Record<string, any> = {};

    if (search) {
      whereClauses.push(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
      );
      variables.search = `%${search}%`;
    }

    if (name) {
      whereClauses.push('LOWER(user.name) LIKE LOWER(:name)');
      variables.name = `%${name}%`;
    }

    if (email) {
      whereClauses.push('LOWER(user.email) LIKE LOWER(:email)');
      variables.email = `%${email}%`;
    }

    // When both name and email come from one 'search' term, allow OR matching
    if (name && name === email) {
      whereClauses.length = 0;
      qb.andWhere(
        '(LOWER(user.name) LIKE LOWER(:search) OR LOWER(user.email) LIKE LOWER(:search))',
        { search: `%${name}%` },
      );
    } else if (whereClauses.length > 0) {
      qb.andWhere(whereClauses.join(' AND '), variables);
    }

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    if (active !== undefined) {
      qb.andWhere('user.active = :active', { active });
    }

    return qb.orderBy('user.name', 'ASC').getMany();
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    search?: string,
    active?: number,
    role?: string,
    rankId?: number,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Load rank relation
    queryBuilder.leftJoinAndSelect('user.rank', 'rank');

    // Track if we have any conditions
    let hasConditions = false;

    // Add search condition if provided
    if (search) {
      queryBuilder.where(
        '(user.name LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
      hasConditions = true;
    }

    // Add active filter if provided
    if (active !== undefined) {
      if (hasConditions) {
        queryBuilder.andWhere('user.active = :active', { active });
      } else {
        queryBuilder.where('user.active = :active', { active });
        hasConditions = true;
      }
    }

    // Add role filter if provided
    if (role) {
      if (hasConditions) {
        queryBuilder.andWhere('user.role = :role', { role });
      } else {
        queryBuilder.where('user.role = :role', { role });
        hasConditions = true;
      }
    }

    // Add rank filter if provided
    if (rankId !== undefined) {
      if (hasConditions) {
        queryBuilder.andWhere('user.rankId = :rankId', { rankId });
      } else {
        queryBuilder.where('user.rankId = :rankId', { rankId });
        hasConditions = true;
      }
    }

    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by created date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async activateUser(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    user.active = 1;
    return await this.userRepository.save(user);
  }

  async deactivateUser(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return null;

    user.active = 0;
    return await this.userRepository.save(user);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;

    return this.userRepository.save(user);
  }

  async changePasswordByAdmin(
    userId: number,
    newPassword: string,
  ): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;

    return this.userRepository.save(user);
  }

  async getStats(): Promise<{
    totalUsers: number;
    adminCount: number;
    managerCount: number;
    userCount: number;
    activeCount: number;
    inactiveCount: number;
  }> {
    const totalUsers = await this.userRepository.count();
    const adminCount = await this.userRepository.count({
      where: { role: UserRole.ADMIN },
    });
    const managerCount = await this.userRepository.count({
      where: { role: UserRole.MANAGER },
    });
    const userCount = await this.userRepository.count({
      where: { role: UserRole.USER },
    });
    const activeCount = await this.userRepository.count({
      where: { active: 1 },
    });
    const inactiveCount = await this.userRepository.count({
      where: { active: 0 },
    });

    return {
      totalUsers,
      adminCount,
      managerCount,
      userCount,
      activeCount,
      inactiveCount,
    };
  }
}
