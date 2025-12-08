import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Territory } from './entities/territory.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { CreateTerritoryDto } from './dto/create-territory.dto';
import { UpdateTerritoryDto } from './dto/update-territory.dto';

@Injectable()
export class TerritoryService {
  constructor(
    @InjectRepository(Territory)
    private territoryRepository: Repository<Territory>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async findAll(): Promise<Territory[]> {
    return this.territoryRepository.find({ relations: ['manager', 'users'] });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    data: Territory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const qb = this.territoryRepository
      .createQueryBuilder('territory')
      .leftJoinAndSelect('territory.manager', 'manager')
      .leftJoinAndSelect('territory.users', 'users');

    if (search) {
      qb.where(
        '(territory.name LIKE :search OR manager.name LIKE :search OR manager.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const offset = (page - 1) * limit;
    qb.skip(offset).take(limit);
    qb.orderBy('territory.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return { data, total, page, limit, totalPages, hasNext, hasPrev };
  }

  async findOne(id: number): Promise<Territory> {
    const territory = await this.territoryRepository.findOne({
      where: { id },
      relations: ['manager', 'users'],
    });
    if (!territory) throw new NotFoundException('Territory not found');
    return territory;
  }

  async create(dto: CreateTerritoryDto): Promise<Territory> {
    const manager = await this.userRepository.findOne({
      where: { name: dto.managerName, role: UserRole.MANAGER },
    });
    if (!manager) throw new NotFoundException('Manager not found');

    const territory = this.territoryRepository.create({
      name: dto.name,
      manager,
      users: [],
    });
    return this.territoryRepository.save(territory);
  }

  async update(id: number, dto: UpdateTerritoryDto): Promise<Territory> {
    return await this.dataSource.transaction(async (manager) => {
      const territory = await manager.findOne(Territory, {
        where: { id },
        relations: ['manager', 'users'],
      });
      if (!territory) throw new NotFoundException('Territory not found');

      if (dto.name !== undefined) territory.name = dto.name;
      if (dto.managerId !== undefined) {
        const managerUser = await manager.findOne(User, {
          where: { id: dto.managerId },
        });
        if (!managerUser) throw new NotFoundException('Manager not found');
        territory.manager = managerUser;
      }

      // Save basic territory info first
      await manager.save(Territory, territory);

      // Handle users relationship separately if provided
      if (dto.userIds !== undefined) {
        // Delete all existing relationships for this territory
        await manager.query(
          'DELETE FROM territory_users WHERE territoryId = ?',
          [id],
        );

        // Insert new relationships
        if (dto.userIds.length > 0) {
          const values = dto.userIds
            .map((userId) => `(${userId}, ${id})`)
            .join(', ');
          await manager.query(
            `INSERT INTO territory_users (userId, territoryId) VALUES ${values}`,
          );
        }
      }

      // Return updated territory with relations
      const updatedTerritory = await manager.findOne(Territory, {
        where: { id },
        relations: ['manager', 'users'],
      });
      if (!updatedTerritory)
        throw new NotFoundException('Territory not found after update');
      return updatedTerritory;
    });
  }

  async remove(id: number): Promise<void> {
    await this.territoryRepository.delete(id);
  }

  async getStats(): Promise<{
    totalTerritories: number;
    totalManagers: number;
    totalMembers: number;
  }> {
    const totalTerritories = await this.territoryRepository.count();

    // Count distinct managers assigned to territories
    const totalManagers = await this.territoryRepository
      .createQueryBuilder('territory')
      .select('COUNT(DISTINCT territory.managerId)', 'count')
      .getRawOne<{ count: string }>()
      .then((r) => Number(r?.count ?? 0));

    // Sum members across territories
    const totalMembers = await this.territoryRepository
      .createQueryBuilder('territory')
      .leftJoin('territory.users', 'users')
      .select('COUNT(users.id)', 'count')
      .getRawOne<{ count: string }>()
      .then((r) => Number(r?.count ?? 0));

    return { totalTerritories, totalManagers, totalMembers };
  }
}
