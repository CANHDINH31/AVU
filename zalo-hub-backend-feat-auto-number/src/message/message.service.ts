import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagePaginationDto } from './dto/message-pagination.dto';
import { DEFAULT_MESSAGE_LIMIT } from '../constant/constants';
import { ZaloService } from 'src/zalo/zalo.service';
import { ConversationService } from 'src/conversation/conversation.service';
import { ThreadType } from 'zca-js';

// Interface cho SeenEventMessageParams dựa trên message entity
interface SeenEventMessageParams {
  msgId: string;
  ts: string;
  cliMsgId: string;
  uidFrom: string;
  idTo: string;
  msgType: string;
  cmd: number;
  st: number;
  at: number;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @Inject(forwardRef(() => ZaloService))
    private zaloService: ZaloService,
    @Inject(forwardRef(() => ConversationService))
    private conversationService: ConversationService,
  ) {}

  create(createMessageDto: CreateMessageDto) {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  findAll() {
    return this.messageRepository.find({
      relations: ['conversation', 'sender'],
    });
  }

  findOne(id: number) {
    return this.messageRepository.findOne({
      where: { id },
      relations: ['conversation', 'sender'],
    });
  }

  async findByConversationId(
    conversationId: number,
    paginationDto: MessagePaginationDto,
  ) {
    const { beforeId, limit = DEFAULT_MESSAGE_LIMIT } = paginationDto;
    const where: any = { conversationId };
    if (beforeId) {
      where.id = LessThan(beforeId);
    }
    const messages = await this.messageRepository.find({
      where,
      relations: ['conversation', 'sender', 'reactions', 'replyTo'],
      order: { id: 'DESC' },
      take: limit + 1,
    });
    const hasNextPage = messages.length > limit;
    const resultMessages = hasNextPage ? messages.slice(0, limit) : messages;
    return {
      messages: resultMessages.reverse(),
      hasNextPage,
    };
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return this.messageRepository.update(id, updateMessageDto);
  }

  async markAsRead(id: number) {
    return this.messageRepository.update(id, { isRead: 1 });
  }

  async markConversationAsRead(conversationId: number) {
    const conversation = await this.conversationService.findOne(conversationId);

    const unreadMessages = await this.messageRepository.find({
      where: { conversationId, isRead: 0 },
    });

    const updateResult = await this.messageRepository.update(
      { conversationId, isRead: 0 },
      { isRead: 1 },
    );

    if (unreadMessages.length > 0) {
      try {
        const seenEventMessages: SeenEventMessageParams[] = unreadMessages.map(
          (msg) => ({
            msgId: msg.msgId,
            ts: msg.ts,
            cliMsgId: msg.cliMsgId,
            uidFrom: msg.uidFrom,
            idTo: msg.idTo,
            msgType: msg.msgType,
            cmd: msg.cmd,
            st: msg.st,
            at: msg.at,
          }),
        );

        await this.zaloService.sendSeenEvent(
          conversation.account_id,
          ThreadType.User,
          seenEventMessages,
        );
      } catch (error) {}
    }

    return updateResult;
  }

  remove(id: number) {
    return this.messageRepository.delete(id);
  }

  async countUnreadByConversationId(conversationId: number): Promise<number> {
    return this.messageRepository.count({
      where: { conversationId, isRead: 0 },
    });
  }
}
