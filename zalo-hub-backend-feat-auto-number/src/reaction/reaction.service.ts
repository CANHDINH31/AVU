import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private reactionRepository: Repository<Reaction>,
  ) {}

  create(createReactionDto: CreateReactionDto) {
    const reaction = this.reactionRepository.create(createReactionDto);
    return this.reactionRepository.save(reaction);
  }

  findAll() {
    return this.reactionRepository.find();
  }

  findOne(id: number) {
    return this.reactionRepository.findOne({ where: { id } });
  }

  update(id: number, updateReactionDto: UpdateReactionDto) {
    const dto: any = { ...updateReactionDto };
    if (dto.rMsg) dto.rMsg = dto.rMsg as any;
    return this.reactionRepository.update(id, dto);
  }

  async markConversationAsRead(conversationId: number) {
    const updateResult = await this.reactionRepository.update(
      { conversationId, isRead: 0 },
      { isRead: 1 },
    );

    return updateResult;
  }

  remove(id: number) {
    return this.reactionRepository.delete(id);
  }
}
