import {
  Injectable,
  NotFoundException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { MessageService } from '../message/message.service';
import { User, UserRole } from '../user/entities/user.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: Partial<Conversation>): Promise<Conversation> {
    const conversation = this.conversationRepository.create(data);
    return this.conversationRepository.save(conversation);
  }

  async findAll(): Promise<Conversation[]> {
    return this.conversationRepository.find();
  }

  async findOne(id: number, includeMessages = false): Promise<Conversation> {
    const relations = ['account', 'friend'];
    if (includeMessages) relations.push('messages');
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations,
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async findOneWithMessages(id: number): Promise<Conversation> {
    return this.findOne(id, true);
  }

  async update(id: number, data: Partial<Conversation>): Promise<Conversation> {
    const conversation = await this.findOne(id);
    Object.assign(conversation, data);
    return this.conversationRepository.save(conversation);
  }

  async togglePin(id: number): Promise<Conversation> {
    const conversation = await this.findOne(id);
    conversation.isPinned = conversation.isPinned === 1 ? 0 : 1;
    return this.conversationRepository.save(conversation);
  }

  async remove(id: number): Promise<void> {
    const conversation = await this.findOne(id);
    await this.conversationRepository.remove(conversation);
  }

  async countByAccountId(accountId: number): Promise<number> {
    return this.conversationRepository.count({
      where: { account_id: accountId },
    });
  }

  async getConversationByFriendIdAndAccountId(
    friendId: number,
    accountId: number,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: [{ account_id: accountId, friend_id: friendId }],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async getConversationsByAccountIds(
    accountIds: number[],
    userId: number,
  ): Promise<any[]> {
    try {
      // Get current user to check role
      const currentUser = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['managedTerritories'],
      });

      if (!currentUser) {
        return [];
      }

      const subQuery = this.conversationRepository.manager
        .createQueryBuilder()
        .select('message.id')
        .from('messages', 'message')
        .where('message.conversation_id = conversation.id')
        .andWhere("message.message_status = 'sent'")
        .orderBy('message.created_at', 'DESC')
        .limit(1);

      const queryBuilder = this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.friend', 'friend')
        .leftJoin('conversation.account', 'account')
        .leftJoin('account.user', 'accountUser')
        .addSelect([
          'account.displayName',
          'account.username',
          'account.id',
          'account.userId',
        ])
        .addSelect([
          'accountUser.id',
          'accountUser.name',
          'accountUser.email',
          'accountUser.role',
        ])
        .leftJoinAndSelect(
          'conversation.messages',
          'lastMessage',
          `lastMessage.id = (${subQuery.getQuery()})`,
        )
        .where('conversation.account_id IN (:...accountIds)', { accountIds });

      // Apply role-based filtering
      switch (currentUser.role) {
        case UserRole.ADMIN:
          break;

        case UserRole.MANAGER:
          // Manager can access conversations from accounts in their managed territories
          if (
            currentUser.managedTerritories &&
            currentUser.managedTerritories.length > 0
          ) {
            const territoryIds = currentUser.managedTerritories.map(
              (t) => t.id,
            );

            // Get users in managed territories
            const territoryUsersQuery = this.userRepository
              .createQueryBuilder('user')
              .leftJoin('user.territories', 'territory')
              .where('territory.id IN (:...territoryIds)', { territoryIds })
              .orWhere('user.id = :userId', { userId }); // Include manager themselves

            const territoryUsers = await territoryUsersQuery.getMany();
            const accessibleUserIds = territoryUsers.map((u) => u.id);

            queryBuilder.andWhere('account.userId IN (:...accessibleUserIds)', {
              accessibleUserIds,
            });
          } else {
            // Manager with no territories can only access their own accounts
            queryBuilder.andWhere('account.userId = :userId', { userId });
          }
          break;

        case UserRole.USER:
        default:
          // Regular user can only access their own accounts
          queryBuilder.andWhere('account.userId = :userId', { userId });
          break;
      }

      queryBuilder
        .orderBy('lastMessage.created_at', 'DESC')
        .addOrderBy('conversation.createdAt', 'DESC');

      const conversations = await queryBuilder.getMany();

      const result = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount =
            await this.messageService.countUnreadByConversationId(conv.id);
          // Lấy reaction chưa đọc gần nhất (isRead=0, createdAt mới nhất) cho conversation này
          const latestUnreadReaction = await this.conversationRepository.manager
            .getRepository('reactions')
            .createQueryBuilder('reaction')
            .where('reaction.conversation_id = :conversationId', {
              conversationId: conv.id,
            })
            .andWhere('reaction.is_read = 0')
            .orderBy('reaction.created_at', 'DESC')
            .getOne();
          return { ...conv, unreadCount, latestUnreadReaction };
        }),
      );
      return result;
    } catch (error) {
      console.error('Error in getConversationsByAccountIds:', error);
      return [];
    }
  }
}
