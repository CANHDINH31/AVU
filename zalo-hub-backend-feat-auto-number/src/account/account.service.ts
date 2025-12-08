import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Account } from './entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateAccountSettingsDto } from './dto/update-account-settings.dto';
import { ZaloService } from '../zalo/zalo.service';
import { User, UserRole } from '../user/entities/user.entity';
import { Territory } from '../territory/entities/territory.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Territory)
    private territoryRepository: Repository<Territory>,
    private zaloService: ZaloService,
  ) {}

  async create(
    userId: number,
    createAccountDto: CreateAccountDto,
  ): Promise<Account> {
    // Check if account with same userZaloId exists
    if (createAccountDto.userZaloId) {
      const existingAccount = await this.accountRepository.findOne({
        where: { userZaloId: createAccountDto.userZaloId },
        relations: ['user'],
      });

      if (existingAccount) {
        // If account exists, check if userId matches
        if (existingAccount.userId === userId) {
          // Same user, update existing account
          await this.accountRepository.update(
            existingAccount.id,
            createAccountDto,
          );
          const updatedAccount = await this.accountRepository.findOne({
            where: { id: existingAccount.id },
            relations: ['user'],
          });
          if (!updatedAccount) {
            throw new Error('Failed to update account');
          }
          return updatedAccount;
        } else {
          // Different user, update userId and other fields
          await this.accountRepository.update(existingAccount.id, {
            ...createAccountDto,
            userId,
          });
          const updatedAccount = await this.accountRepository.findOne({
            where: { id: existingAccount.id },
            relations: ['user'],
          });
          if (!updatedAccount) {
            throw new Error('Failed to update account');
          }
          return updatedAccount;
        }
      }
    }

    // Create new account if no existing account found
    const account = this.accountRepository.create({
      ...createAccountDto,
      userId,
    });
    return await this.accountRepository.save(account);
  }

  async findAll(): Promise<Account[]> {
    return await this.accountRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return account;
  }

  async update(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findOne(id);
    Object.assign(account, updateAccountDto);
    return await this.accountRepository.save(account);
  }

  async remove(id: number, currentUserId: number): Promise<void> {
    const account = await this.findOne(id);

    if (account.userId !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to delete this account',
      );
    }

    await this.accountRepository.update(id, { userId: undefined });
  }

  async updateSettings(
    id: number,
    updateSettingsDto: UpdateAccountSettingsDto,
    currentUserId: number,
  ): Promise<Account> {
    const account = await this.findOne(id);

    // Check permission - user must own the account
    if (account.userId !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to update this account settings',
      );
    }

    // Update only the settings fields
    if (updateSettingsDto.autoFriendRequestEnabled !== undefined) {
      account.autoFriendRequestEnabled =
        updateSettingsDto.autoFriendRequestEnabled;
    }
    if (updateSettingsDto.friendRequestStartTime !== undefined) {
      account.friendRequestStartTime = updateSettingsDto.friendRequestStartTime;
    }
    if (updateSettingsDto.autoMessageEnabled !== undefined) {
      account.autoMessageEnabled = updateSettingsDto.autoMessageEnabled;
    }
    if (updateSettingsDto.bulkMessageContent !== undefined) {
      account.bulkMessageContent = updateSettingsDto.bulkMessageContent;
    }

    return await this.accountRepository.save(account);
  }

  async findAllByUserId(userId: number, search?: string): Promise<Account[]> {
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user')
      .where('account.userId = :userId', { userId });

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(account.displayName) LIKE LOWER(:search) OR LOWER(account.phoneNumber) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    const accounts = await queryBuilder.getMany();

    const newAccounts =
      await this.zaloService.checkMultipleConnections(accounts);

    return newAccounts;
  }

  async findOneByUserIdAndZaloId(
    userId: number,
    userZaloId: string,
  ): Promise<Account | null> {
    return await this.accountRepository.findOne({
      where: { userId, userZaloId },
      relations: ['user'],
    });
  }

  /**
   * Get accounts based on user role and permissions
   * - Admin: can see all accounts
   * - Manager: can see their own accounts + accounts of users in their managed territories
   * - User: can only see their own accounts
   */
  async findAllWithRoleBasedAccess(
    currentUserId: number,
    search?: string,
    filterUserId?: number,
  ): Promise<Account[]> {
    // Get current user with role
    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['managedTerritories', 'territories'],
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    let allowedUserIds: number[] = [];

    switch (currentUser.role) {
      case UserRole.ADMIN:
        // Admin can see all accounts - no filter needed
        break;

      case UserRole.MANAGER: {
        // Manager can see their own accounts + accounts of users in their managed territories
        allowedUserIds = [currentUserId];

        // Get all users in territories managed by this user
        const managedTerritories = await this.territoryRepository.find({
          where: { manager: { id: currentUserId } },
          relations: ['users'],
        });

        // Collect all user IDs from managed territories
        const territoryUserIds: number[] = [];
        for (const territory of managedTerritories) {
          if (territory.users && territory.users.length > 0) {
            territoryUserIds.push(...territory.users.map((user) => user.id));
          }
        }

        // Add territory user IDs to allowed list
        if (territoryUserIds.length > 0) {
          allowedUserIds.push(...territoryUserIds);
        }

        // Remove duplicates
        allowedUserIds = [...new Set(allowedUserIds)];

        // Ensure we always have at least the current user ID
        if (allowedUserIds.length === 0) {
          allowedUserIds = [currentUserId];
        }
        break;
      }

      case UserRole.USER:
      default:
        // User can only see their own accounts
        allowedUserIds = [currentUserId];
        break;
    }

    // Build query
    const queryBuilder = this.accountRepository
      .createQueryBuilder('account')
      .leftJoinAndSelect('account.user', 'user');

    // Apply user filter if not admin
    if (currentUser.role !== UserRole.ADMIN) {
      // Ensure allowedUserIds is not empty to prevent SQL errors
      if (allowedUserIds.length === 0) {
        allowedUserIds = [currentUserId];
      }

      queryBuilder.where('account.userId IN (:...allowedUserIds)', {
        allowedUserIds,
      });
    }

    // Apply specific user filter if provided
    if (filterUserId) {
      // Check if the current user has permission to filter by this userId
      const canAccessUser =
        currentUser.role === UserRole.ADMIN ||
        allowedUserIds.includes(filterUserId);

      if (canAccessUser) {
        queryBuilder.andWhere('account.userId = :filterUserId', {
          filterUserId,
        });
      } else {
        throw new ForbiddenException(
          'You do not have permission to filter by this user',
        );
      }
    }

    // Apply search filter
    if (search) {
      const searchCondition =
        currentUser.role === UserRole.ADMIN
          ? '(LOWER(account.displayName) LIKE LOWER(:search) OR LOWER(account.phoneNumber) LIKE LOWER(:search))'
          : '(LOWER(account.displayName) LIKE LOWER(:search) OR LOWER(account.phoneNumber) LIKE LOWER(:search))';

      queryBuilder.andWhere(searchCondition, { search: `%${search}%` });
    }

    const accounts = await queryBuilder.getMany();

    // Check connections for all accounts
    const accountsWithConnectionStatus =
      await this.zaloService.checkMultipleConnections(accounts);

    return accountsWithConnectionStatus;
  }

  /**
   * Helper method to get user IDs that a user can access based on their role
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

        // Collect all user IDs from managed territories
        const territoryUserIds: number[] = [];
        for (const territory of managedTerritories) {
          if (territory.users && territory.users.length > 0) {
            territoryUserIds.push(...territory.users.map((user) => user.id));
          }
        }

        // Add territory user IDs to accessible list
        if (territoryUserIds.length > 0) {
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

  /**
   * Get list of users that can be used for filtering accounts
   */
  async getFilterableUsers(userId: number): Promise<User[]> {
    const accessibleUserIds = await this.getAccessibleUserIds(userId);

    return await this.userRepository.find({
      where: { id: In(accessibleUserIds) },
      select: ['id', 'name', 'email', 'role'],
      order: { name: 'ASC' },
    });
  }
}
