import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sticker } from './entities/sticker.entity';

@Injectable()
export class StickerService {
  constructor(
    @InjectRepository(Sticker)
    private stickerRepository: Repository<Sticker>,
  ) {}

  findAll() {
    return this.stickerRepository.find();
  }

  async getCategories() {
    const categories = await this.stickerRepository
      .createQueryBuilder('sticker')
      .select('DISTINCT sticker.cateId', 'cateId')
      .getRawMany();

    return categories.map((cat) => cat.cateId);
  }

  findByCategory(cateId: number) {
    return this.stickerRepository.find({
      where: { cateId },
      order: { id: 'ASC' },
    });
  }

  async searchByCategoryId(categoryId: string) {
    return this.stickerRepository
      .createQueryBuilder('sticker')
      .where('sticker.cateId LIKE :categoryId', {
        categoryId: `%${categoryId}%`,
      })
      .orderBy('sticker.id', 'ASC')
      .getMany();
  }

  async searchByStickerId(stickerId: string) {
    return this.stickerRepository
      .createQueryBuilder('sticker')
      .where('sticker.stickerId LIKE :stickerId', {
        stickerId: `%${stickerId}%`,
      })
      .orderBy('sticker.id', 'ASC')
      .getMany();
  }
}
