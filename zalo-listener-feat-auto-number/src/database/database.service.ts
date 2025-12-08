import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not, IsNull, In, LessThan } from "typeorm";
import { Account } from "../entities/account.entity";
import { Message } from "../entities/message.entity";
import { Conversation } from "../entities/conversation.entity";
import { Friend } from "../entities/friend.entity";
import { Reaction } from "@/entities/reaction.entity";
import { Sticker } from "@/entities/sticker.entity";
import { FailedFileStorage } from "@/entities/failed-file-storage.entity";

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
    @InjectRepository(Reaction)
    private readonly reactionRepository: Repository<Reaction>,
    @InjectRepository(Sticker)
    private readonly stickerRepository: Repository<Sticker>,
    @InjectRepository(FailedFileStorage)
    private readonly failedFileStorageRepository: Repository<FailedFileStorage>
  ) {}

  async getAccounts(): Promise<Account[]> {
    try {
      const accounts = await this.accountRepository.find({
        where: {
          cookies: Not(IsNull()),
          imei: Not(IsNull()),
          userAgent: Not(IsNull()),
        },
      });

      return accounts;
    } catch (error) {
      throw error;
    }
  }

  async getAccountById(id: number): Promise<Account> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id },
      });

      if (!account) {
        throw new Error(`Account with id ${id} not found`);
      }

      return account;
    } catch (error) {
      throw error;
    }
  }

  async updateAccountConnection(id: number, isConnect: boolean): Promise<void> {
    try {
      await this.accountRepository.update(id, { isConnect: isConnect ? 1 : 0 });
    } catch (error) {
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.accountRepository.query("SELECT 1");
      return true;
    } catch (error) {
      return false;
    }
  }

  async findMessageByMsgId(
    msgId: string,
    isSelf: boolean
  ): Promise<Message | null> {
    try {
      return await this.messageRepository.findOne({
        where: { msgId, isSelf: isSelf ? 1 : 0 },
      });
    } catch (error) {
      throw error;
    }
  }

  async findConversationByAccountIdAndUserZaloIdAndUserKey(
    accountId: number,
    userZaloId: string,
    userKey: string
  ): Promise<Conversation | null> {
    try {
      return await this.conversationRepository.findOne({
        where: {
          account_id: accountId,
          userZaloId,
          userKey,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async findConversationByUserZaloIdAndUserKeyAndUpdateIsFr(
    userZaloId: string,
    userKey: string,
    isFr: number
  ) {
    try {
      await this.conversationRepository.update(
        {
          userZaloId,
          userKey,
        },
        { isFr }
      );

      const conversation = await this.conversationRepository.findOne({
        where: {
          userZaloId,
          userKey,
        },
      });

      return conversation;
    } catch (error) {
      throw error;
    }
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    try {
      const message = this.messageRepository.create(messageData);
      return await this.messageRepository.save(message);
    } catch (error) {
      throw error;
    }
  }

  async updateMessage(message: Message): Promise<Message> {
    try {
      return await this.messageRepository.save(message);
    } catch (error) {
      throw error;
    }
  }

  async updateMessagesAsRead(msgIds: string[]): Promise<void> {
    try {
      // Lấy danh sách unique threadId từ msgIds
      const threadIds = await this.getThreadIdsByMsgIds(msgIds);

      await this.messageRepository.update(
        {
          threadId: In(threadIds),
          isRead: 0,
        },
        {
          isRead: 1,
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async getThreadIdsByMsgIds(msgIds: string[]): Promise<string[]> {
    try {
      const messages = await this.messageRepository.find({
        where: { msgId: In(msgIds) },
        select: ["threadId"],
      });
      // Trả về unique threadId
      return Array.from(new Set(messages.map((m) => m.threadId)));
    } catch (error) {
      throw error;
    }
  }

  public getConversationRepository() {
    return this.conversationRepository;
  }

  public getFriendRepository() {
    return this.friendRepository;
  }

  // Friend methods
  public async findFriendByUserKey(userKey: string) {
    return this.friendRepository.findOne({ where: { userKey } });
  }
  public saveFriend(friend: Friend) {
    return this.friendRepository.save(friend);
  }
  public createFriend(data: Partial<Friend>) {
    return this.friendRepository.create(data);
  }

  public saveConversation(data: Partial<Conversation>) {
    return this.conversationRepository.save(data);
  }

  // Message methods
  public async findMessageByMsgIdAndThreadIdAndUidFromAndIdTo(
    msgId: string,
    threadId: string,
    uidFrom: string,
    idTo: string
  ) {
    return this.messageRepository.findOne({
      where: {
        msgId,
        threadId,
        uidFrom,
        idTo,
      },
    });
  }

  public async findMessageByMsgIdAndThreadIdAndUidFromAndIdToAndQuote(
    msgId: string,
    cliMsgId: string,
    uidFrom: string,
    idTo: string
  ) {
    return this.messageRepository.findOne({
      where: {
        msgId,
        cliMsgId,
        uidFrom,
        idTo,
      },
    });
  }

  // Reaction methods
  public saveReaction(data: Partial<Reaction>) {
    return this.reactionRepository.save(data);
  }

  public async deleteReactionsByMsgIdAndThreadId(
    gMsgID: string,
    cMsgID: string,
    threadId: string
  ): Promise<void> {
    try {
      await this.reactionRepository.delete({ gMsgID, cMsgID, threadId });
    } catch (error) {
      console.log(error);
    }
  }

  public async deleteReactionsByMsgIdAndDnameOrMsgSender(
    gMsgID: string,
    cMsgID: string,
    threadId: string,
    dName?: string,
    msgSender?: string
  ): Promise<void> {
    try {
      if (dName) {
        // Nếu có dName thì xóa theo dName
        await this.reactionRepository.delete({
          gMsgID,
          cMsgID,
          threadId,
          dName,
        });
      } else if (msgSender) {
        // Nếu có msgSender thì xóa theo msgSender
        await this.reactionRepository.delete({
          gMsgID,
          cMsgID,
          threadId,
          msgSender,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Sticker methods
  public async findStickerByStickerIdAndCateIdAndType(
    stickerId: number,
    cateId: number,
    type: number
  ): Promise<Sticker | null> {
    try {
      return await this.stickerRepository.findOne({
        where: {
          stickerId,
          cateId,
          type,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  public async saveSticker(stickerData: Partial<Sticker>): Promise<Sticker> {
    try {
      const sticker = this.stickerRepository.create(stickerData);
      return await this.stickerRepository.save(sticker);
    } catch (error) {
      throw error;
    }
  }

  // Undo methods
  public async findMessageByGlobalMsgIdAndCliMsgIdAndUpdateUndo(
    msgId: string,
    cliMsgId: string,
    uidFrom: string,
    idTo: string
  ) {
    await this.messageRepository.update(
      { msgId, cliMsgId, uidFrom, idTo },
      { undo: 1 }
    );
    return await this.messageRepository.findOne({
      where: { msgId, cliMsgId, uidFrom, idTo },
    });
  }

  // Find friend by userId or userKey and accountId
  public async findFriendByUserIdOrUserKeyAndAccountId(
    accountId: number,
    friendZaloId: string
  ): Promise<Friend | null> {
    return this.friendRepository.findOne({
      where: [
        { accountId, userId: friendZaloId },
        { accountId, userKey: friendZaloId },
      ],
    });
  }

  // Find conversation by friendId and accountId
  public async findConversationByFriendIdAndAccountId(
    friendId: number,
    accountId: number
  ): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { account_id: accountId, friend_id: friendId },
    });
  }

  // Get message repository
  public getMessageRepository() {
    return this.messageRepository;
  }

  // Get failed file storage repository
  public getFailedFileStorageRepository() {
    return this.failedFileStorageRepository;
  }

  // Create failed file storage record
  public async createFailedFileStorage(data: {
    messageId: number;
    path: string;
  }) {
    const failedFileStorage = this.failedFileStorageRepository.create(data);
    return await this.failedFileStorageRepository.save(failedFileStorage);
  }

  // Get expired failed file storage records (older than 7 days)
  public async getExpiredFailedFileStorage(days: number = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return await this.failedFileStorageRepository.find({
      where: {
        createdAt: LessThan(date),
      },
      relations: ["message"],
    });
  }

  // Delete failed file storage by id
  public async deleteFailedFileStorage(id: number) {
    return await this.failedFileStorageRepository.delete(id);
  }

  // Delete multiple failed file storage by ids
  public async deleteFailedFileStorageByIds(ids: number[]) {
    if (ids.length === 0) return;
    return await this.failedFileStorageRepository.delete(ids);
  }

  // Update message isExpired to 0
  public async updateMessageIsExpired(messageId: number) {
    return await this.messageRepository.update(
      { id: messageId },
      { isExpired: 0 }
    );
  }

  // Update multiple messages isExpired to 0
  public async updateMessagesIsExpired(messageIds: number[]) {
    if (messageIds.length === 0) return;
    return await this.messageRepository.update(
      { id: In(messageIds) },
      { isExpired: 0 }
    );
  }
}
