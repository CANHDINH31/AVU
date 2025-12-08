import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fork } from 'child_process';
import * as path from 'path';
import { Account } from 'src/account/entities/account.entity';
import { Repository } from 'typeorm';
import {
  Reactions,
  SendSeenEventMessageParams,
  ThreadType,
  Zalo,
} from 'zca-js';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Friend } from 'src/friend/entities/friend.entity';
import { FriendRequest } from 'src/friend-request/entities/friend-request.entity';
import { ConversationService } from '../conversation/conversation.service';
import { UploadService } from 'src/upload/upload.service';
import { QuoteMessageDto } from './dto/quote-message.dto';
import { SentFriendRequest } from 'src/sent-friend-request/entities/sent-friend-request.entity';
import { SocketService } from '../socket/socket.service';
import { UserService } from 'src/user/user.service';
import { MessageService } from '../message/message.service';
import { Message } from '../message/entities/message.entity';

@Injectable()
export class ZaloService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,
    @InjectRepository(SentFriendRequest)
    private sentFriendRequestRepository: Repository<SentFriendRequest>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectQueue('friend-sync') private friendSyncQueue: Queue,
    @Inject(forwardRef(() => ConversationService))
    private conversationService: ConversationService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    @Inject(UploadService) private readonly uploadService: UploadService,
    private readonly userService: UserService,
    private socketService: SocketService,
  ) {}

  async genQr() {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'zalo.worker.js');
      const child = fork(workerPath);

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error('QR worker timeout'));
      }, 60000);

      child.on('message', (message: any) => {
        if (message.isLoggedIn) {
          clearTimeout(timeout);
          resolve(message);
          child.kill();
        } else {
          resolve(message);
        }
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error('QR worker failed to start: ' + err.message));
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`QR worker exited with code ${code}`));
        }
      });

      child.send({ type: 'gen-qr' });
    });
  }

  async checkLogin(sessionId: string) {
    return new Promise((resolve, reject) => {
      const workerPath = path.join(__dirname, 'zalo.worker.js');
      const child = fork(workerPath);

      const timeout = setTimeout(() => {
        child.kill();
        resolve({ error: 'Timeout hoặc session không tồn tại' });
      }, 5000);

      child.on('message', (result) => {
        clearTimeout(timeout);
        resolve(result);
        child.kill();
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        reject(new Error('Worker failed: ' + err.message));
      });

      child.on('exit', (code) => {
        if (code !== 0) {
          clearTimeout(timeout);
          reject(new Error(`Worker exited with code ${code}`));
        }
      });

      child.send({ type: 'check-login', sessionId });
    });
  }

  async syncFriendsWithQueue(accountId: number, userId: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    // Check if the account belongs to the requesting user (skip for admin)
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin && account.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to sync friends for this account',
      );
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      let friends = await api.getAllFriends();
      friends = friends.filter(
        (friend) => friend.type !== 5 && friend.accountStatus !== 2,
      );

      // Add job to queue
      await this.friendSyncQueue.add(
        'sync-friends',
        {
          accountId,
          friends,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );

      return {
        message:
          'Đang đồng bộ danh sách bạn bè. Quá trình này có thể mất 1-2 phút.',
        totalFriends: friends.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async syncFriends(accountId: number, userId: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    // Check if the account belongs to the requesting user (skip for admin)
    const isAdmin = await this.userService.isAdmin(userId);
    if (!isAdmin && account.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to sync friends for this account',
      );
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      let friends = await api.getAllFriends();

      const { recommItems } = await api.getFriendRecommendations();

      let sendFriendRequests;
      try {
        sendFriendRequests = await api.getSentFriendRequest();
      } catch (error) {}

      friends = friends.filter(
        (friend) => friend.type !== 5 && friend.accountStatus !== 2,
      );
      // type = 5 là tài khoản hệ thống zalo
      // accountStatus = 2 là tài khoản đã bị khóa

      const friendRequests = recommItems.filter(
        (fr) => fr.recommItemType === 1,
      );

      await this.processSentFriendRequestsAsync(accountId, sendFriendRequests);

      await this.processFriendRequestsAsync(accountId, friendRequests);

      const result = await this.processFriendsAsync(
        accountId,
        account.userZaloId,
        friends,
      );

      return {
        message: `Đã đồng bộ danh sách ${result.totalFriends} bạn bè và ${result.totalConversations} cuộc hội thoại`,
        ...result,
      };
    } catch (error) {
      console.log(error, 'error');
      throw error;
    }
  }

  async processSentFriendRequestsAsync(
    accountId: number,
    sentFriendRequests: any,
  ) {
    try {
      // Get existing friend requests for this account
      const existingSentFriendRequests =
        await this.sentFriendRequestRepository.find({
          where: { accountId },
        });

      const existingSentFriendRequestsMap = new Map(
        existingSentFriendRequests.map((fr) => [fr.userId, fr]),
      );

      // Convert object to array of friend requests
      const sentfriendRequestsArray = Object.values(sentFriendRequests);

      // Process each friend request
      for (const sentFriendRequest of sentfriendRequestsArray as any[]) {
        const sentExistingFriendRequest = existingSentFriendRequestsMap.get(
          sentFriendRequest.userId,
        );

        if (sentExistingFriendRequest) {
          // Update existing friend request
          sentExistingFriendRequest.zaloName = sentFriendRequest.zaloName;
          sentExistingFriendRequest.displayName = sentFriendRequest.displayName;
          sentExistingFriendRequest.avatar = sentFriendRequest.avatar;
          sentExistingFriendRequest.globalId = sentFriendRequest.globalId;
          sentExistingFriendRequest.bizPkg = JSON.stringify(
            sentFriendRequest.bizPkg,
          );
          sentExistingFriendRequest.fReqInfo = JSON.stringify(
            sentFriendRequest.fReqInfo,
          );

          await this.sentFriendRequestRepository.save(
            sentExistingFriendRequest,
          );
        } else {
          // Create new friend request
          const sentFriendRequestEntity = new SentFriendRequest();
          sentFriendRequestEntity.accountId = accountId;
          sentFriendRequestEntity.userId = sentFriendRequest.userId;
          sentFriendRequestEntity.zaloName = sentFriendRequest.zaloName;
          sentFriendRequestEntity.displayName = sentFriendRequest.displayName;
          sentFriendRequestEntity.avatar = sentFriendRequest.avatar;
          sentFriendRequestEntity.globalId = sentFriendRequest.globalId;
          sentFriendRequestEntity.bizPkg = JSON.stringify(
            sentFriendRequest.bizPkg,
          );
          sentFriendRequestEntity.fReqInfo = JSON.stringify(
            sentFriendRequest.fReqInfo,
          );

          await this.sentFriendRequestRepository.save(sentFriendRequestEntity);
        }
      }

      // Remove friend requests that are no longer in the list
      const currentSentFriendRequestIds = new Set(
        sentfriendRequestsArray.map((fr: any) => fr.userId),
      );
      const sentFriendRequestsToRemove = existingSentFriendRequests.filter(
        (fr) => !currentSentFriendRequestIds.has(fr.userId),
      );

      if (sentFriendRequestsToRemove.length > 0) {
        await this.sentFriendRequestRepository.remove(
          sentFriendRequestsToRemove,
        );
      }

      return {
        totalFriendRequests: sentfriendRequestsArray.length,
      };
    } catch (error) {
      console.error('Error processing friend requests:', error);
      return { totalFriendRequests: 0 };
    }
  }

  async processFriendRequestsAsync(accountId: number, friendRequests: any[]) {
    try {
      // Get existing friend requests for this account
      const existingFriendRequests = await this.friendRequestRepository.find({
        where: { accountId },
      });

      const existingFriendRequestsMap = new Map(
        existingFriendRequests.map((fr) => [fr.userId, fr]),
      );

      // Process each friend request
      for (const friendRequest of friendRequests) {
        // Extract data from dataInfo property
        const requestData = friendRequest.dataInfo;
        const existingFriendRequest = existingFriendRequestsMap.get(
          requestData.userId,
        );

        if (existingFriendRequest) {
          // Update existing friend request
          existingFriendRequest.zaloName = requestData.zaloName;
          existingFriendRequest.displayName = requestData.displayName;
          existingFriendRequest.avatar = requestData.avatar;
          existingFriendRequest.phoneNumber = requestData.phoneNumber;
          existingFriendRequest.status = requestData.status;
          existingFriendRequest.gender = requestData.gender;
          existingFriendRequest.dob = requestData.dob;
          existingFriendRequest.type = requestData.type;
          existingFriendRequest.recommType = requestData.recommType;
          existingFriendRequest.recommSrc = requestData.recommSrc;
          existingFriendRequest.recommTime = requestData.recommTime;
          existingFriendRequest.recommInfo = JSON.stringify(
            requestData.recommInfo,
          );
          existingFriendRequest.bizPkg = JSON.stringify(requestData.bizPkg);

          await this.friendRequestRepository.save(existingFriendRequest);
        } else {
          // Create new friend request
          const friendRequestEntity = new FriendRequest();
          friendRequestEntity.accountId = accountId;
          friendRequestEntity.userId = requestData.userId;
          friendRequestEntity.zaloName = requestData.zaloName;
          friendRequestEntity.displayName = requestData.displayName;
          friendRequestEntity.avatar = requestData.avatar;
          friendRequestEntity.phoneNumber = requestData.phoneNumber;
          friendRequestEntity.status = requestData.status;
          friendRequestEntity.gender = requestData.gender;
          friendRequestEntity.dob = requestData.dob;
          friendRequestEntity.type = requestData.type;
          friendRequestEntity.recommType = requestData.recommType;
          friendRequestEntity.recommSrc = requestData.recommSrc;
          friendRequestEntity.recommTime = requestData.recommTime;
          friendRequestEntity.recommInfo = JSON.stringify(
            requestData.recommInfo,
          );
          friendRequestEntity.bizPkg = JSON.stringify(requestData.bizPkg);

          await this.friendRequestRepository.save(friendRequestEntity);
        }
      }

      // Remove friend requests that are no longer in the list
      const currentFriendRequestIds = new Set(
        friendRequests.map((fr) => fr.dataInfo.userId),
      );
      const friendRequestsToRemove = existingFriendRequests.filter(
        (fr) => !currentFriendRequestIds.has(fr.userId),
      );

      if (friendRequestsToRemove.length > 0) {
        await this.friendRequestRepository.remove(friendRequestsToRemove);
      }

      return {
        totalFriendRequests: friendRequests.length,
      };
    } catch (error) {
      console.error('Error processing friend requests:', error);
      return { totalFriendRequests: 0 };
    }
  }

  async processFriendsAsync(
    accountId: number,
    userZaloId: string,
    friends: any[],
  ) {
    try {
      // Get existing friends for this account
      const existingFriends = await this.friendRepository.find({
        where: { accountId },
      });

      const existingFriendsMap = new Map(
        existingFriends.map((friend) => [friend.userId, friend]),
      );

      // Get existing conversations for this account
      const existingConversations = await this.conversationService.findAll();
      const conversationMap = new Map(
        existingConversations
          .filter((conv) => conv.account_id === accountId)
          .map((conv) => [conv.friend_id, conv]),
      );

      // Process each friend
      for (const friend of friends) {
        const existingFriend = existingFriendsMap.get(friend.userId);

        if (existingFriend) {
          // Update existing friend
          existingFriend.username = friend.username;
          existingFriend.displayName = friend.displayName;
          existingFriend.zaloName = friend.zaloName;
          existingFriend.avatar = friend.avatar;
          existingFriend.bgavatar = friend.bgavatar;
          existingFriend.cover = friend.cover;
          existingFriend.gender = friend.gender;
          existingFriend.dob = friend.dob;
          existingFriend.sdob = friend.sdob;
          existingFriend.status = friend.status;
          existingFriend.phoneNumber = friend.phoneNumber;
          existingFriend.isFr = friend.isFr;
          existingFriend.isBlocked = friend.isBlocked;
          existingFriend.lastActionTime = friend.lastActionTime;
          existingFriend.lastUpdateTime = friend.lastUpdateTime;
          existingFriend.isActive = friend.isActive;
          existingFriend.friendKey = friend.key;
          existingFriend.type = friend.type;
          existingFriend.isActivePC = friend.isActivePC;
          existingFriend.isActiveWeb = friend.isActiveWeb;
          existingFriend.isValid = friend.isValid;
          existingFriend.userKey = friend.userKey;
          existingFriend.accountStatus = friend.accountStatus;
          existingFriend.oaInfo = friend.oaInfo;
          existingFriend.user_mode = friend.user_mode;
          existingFriend.globalId = friend.globalId;
          existingFriend.bizPkg = friend.bizPkg;
          existingFriend.createdTs = friend.createdTs;
          existingFriend.oa_status = friend.oa_status;

          await this.friendRepository.save(existingFriend);

          // Create conversation if not exists
          if (!conversationMap.has(existingFriend.id)) {
            await this.conversationService.create({
              account_id: accountId,
              friend_id: existingFriend.id,
              userZaloId: userZaloId,
              userKey: existingFriend.userKey,
            });
          }
        } else {
          // Create new friend
          const friendEntity = new Friend();
          friendEntity.accountId = accountId;
          friendEntity.userId = friend.userId;
          friendEntity.username = friend.username;
          friendEntity.displayName = friend.displayName;
          friendEntity.zaloName = friend.zaloName;
          friendEntity.avatar = friend.avatar;
          friendEntity.bgavatar = friend.bgavatar;
          friendEntity.cover = friend.cover;
          friendEntity.gender = friend.gender;
          friendEntity.dob = friend.dob;
          friendEntity.sdob = friend.sdob;
          friendEntity.status = friend.status;
          friendEntity.phoneNumber = friend.phoneNumber;
          friendEntity.isFr = friend.isFr;
          friendEntity.isBlocked = friend.isBlocked;
          friendEntity.lastActionTime = friend.lastActionTime;
          friendEntity.lastUpdateTime = friend.lastUpdateTime;
          friendEntity.isActive = friend.isActive;
          friendEntity.friendKey = friend.key;
          friendEntity.type = friend.type;
          friendEntity.isActivePC = friend.isActivePC;
          friendEntity.isActiveWeb = friend.isActiveWeb;
          friendEntity.isValid = friend.isValid;
          friendEntity.userKey = friend.userKey;
          friendEntity.accountStatus = friend.accountStatus;
          friendEntity.oaInfo = friend.oaInfo;
          friendEntity.user_mode = friend.user_mode;
          friendEntity.globalId = friend.globalId;
          friendEntity.bizPkg = friend.bizPkg;
          friendEntity.createdTs = friend.createdTs;
          friendEntity.oa_status = friend.oa_status;

          await this.friendRepository.save(friendEntity);

          // Create conversation for new friend
          await this.conversationService.create({
            account_id: accountId,
            friend_id: friendEntity.id,
            userZaloId: userZaloId,
            userKey: friendEntity.userKey,
          });
        }
      }

      // Remove friends that are no longer in the list
      const currentFriendIds = new Set(friends.map((f) => f.userId));
      const friendsToRemove = existingFriends.filter(
        (friend) => !currentFriendIds.has(friend.userId),
      );

      if (friendsToRemove.length > 0) {
        await this.friendRepository.remove(friendsToRemove);
      }

      // Count conversations for this account
      const totalConversations =
        await this.conversationService.countByAccountId(accountId);
      return {
        totalFriends: friends.length,
        totalConversations,
      };
    } catch (error) {
      return { totalFriends: 0, totalConversations: 0 };
    }
  }

  async checkMultipleConnections(accounts: Account[]) {
    const results: Account[] = [];

    for (const account of accounts) {
      const { cookies, imei, userAgent } = account;

      if (!cookies || !imei || !userAgent) {
        // Update account status to disconnected
        account.isConnect = 0;
        await this.accountRepository.save(account);

        results.push(account);
        continue;
      }

      let parsedCookies;
      try {
        parsedCookies =
          typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
      } catch (error) {
        account.isConnect = 0;
        await this.accountRepository.save(account);

        results.push(account);
        continue;
      }

      const zalo = new Zalo({
        selfListen: false,
        checkUpdate: false,
        logging: false,
      });

      try {
        await zalo.login({
          cookie: parsedCookies,
          imei,
          userAgent,
        });

        // Update account status to connected
        account.isConnect = 1;
        await this.accountRepository.save(account);

        results.push(account);
      } catch (error) {
        // Update account status to disconnected
        account.isConnect = 0;
        await this.accountRepository.save(account);

        results.push(account);
      }
    }

    return results;
  }

  async getAccountsByUserId(userId: number): Promise<Account[]> {
    return this.accountRepository.find({
      where: { userId },
    });
  }

  async sendMessage(
    accountId: number,
    friendZaloId: string,
    message: string,
    type?: string,
    quote?: QuoteMessageDto,
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      // Để test: uncomment dòng dưới để force error
      // throw new Error('Test error: Force send message to fail');

      let result;
      if (type === 'link') {
        result = await api.sendLink(
          {
            link: message,
          },
          friendZaloId,
        );
      } else if (quote?.msgId) {
        result = await api.sendMessage(
          {
            msg: message,
            quote: {
              content: JSON.parse(quote.contentJson ?? ''),
              msgType: quote.msgType ?? '',
              propertyExt: JSON.parse(quote.propertyExtJson ?? '{}'),
              uidFrom: quote.uidFrom ?? '',
              msgId: quote.msgId ?? '',
              cliMsgId: quote.cliMsgId ?? '',
              ts: quote.ts ?? '',
              ttl: quote.ttl ?? 0,
            },
          },
          friendZaloId,
        );
      } else {
        result = await api.sendMessage(
          {
            msg: message,
          },
          friendZaloId,
        );
      }

      // Lưu message vào database với status 'sent' khi gửi thành công
      try {
        // Tìm friend từ friendZaloId (có thể là userId hoặc userKey)
        const friend = await this.friendRepository.findOne({
          where: [
            { accountId, userId: friendZaloId },
            { accountId, userKey: friendZaloId },
          ],
        });

        if (friend) {
          // Tìm conversation từ friendId và accountId
          const conversation =
            await this.conversationService.getConversationByFriendIdAndAccountId(
              friend.id,
              accountId,
            );

          if (conversation && result) {
            // Lấy msgId và cliMsgId từ result
            const msgId = result.message.msgId || result.globalMsgId || '';
            const cliMsgId = result.cliMsgId || '';

            // Delay 500ms để tránh race condition với socket listener
            // Socket có thể đang insert message vào database cùng lúc
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Kiểm tra xem message đã tồn tại chưa dựa vào msgId và isSelf
            const existingMessage = await this.messageRepository.findOne({
              where: { msgId, isSelf: 1 },
            });

            if (existingMessage) {
              // Message đã tồn tại, bỏ qua không lưu lại
              console.log(
                `[DEBUG] Message with msgId ${msgId} and isSelf=1 already exists, skipping save`,
              );
            } else {
              // Tạo message mới với status 'sent'
              const sentMessage = this.messageRepository.create({
                type: 1,
                threadId: friendZaloId,
                isSelf: 1,
                actionId: result.actionId || '',
                msgId: msgId,
                cliMsgId: cliMsgId,
                uidFrom: account!.userZaloId || '',
                idTo: friendZaloId,
                dName: friend?.displayName || friend?.zaloName || '',
                ts: result.ts || Date.now().toString(),
                status: result.status || 0,
                content: message,
                conversationId: conversation.id,
                messageStatus: 'sent',
                source: 'backend',
                senderId: account!.userId || undefined,
                isRead: 1,
                msgType: type === 'link' ? 'chat.link' : 'chat.text',
              });

              await this.messageRepository.save(sentMessage);
            }
          }
        }
      } catch (saveError) {
        // Log lỗi khi lưu message nhưng không throw để không ảnh hưởng đến response
        console.error('Error saving sent message to database:', saveError);
      }

      return { success: true, result };
    } catch (error) {
      try {
        // Tìm friend từ friendZaloId (có thể là userId hoặc userKey)
        const friend = await this.friendRepository.findOne({
          where: [
            { accountId, userId: friendZaloId },
            { accountId, userKey: friendZaloId },
          ],
        });

        if (friend) {
          // Tìm conversation từ friendId và accountId
          const conversation =
            await this.conversationService.getConversationByFriendIdAndAccountId(
              friend.id,
              accountId,
            );

          if (conversation) {
            // Tạo message với status 'failed'
            const failedMessage = this.messageRepository.create({
              type: 1, // Giá trị mặc định cho type
              threadId: friendZaloId,
              isSelf: 1, // Tin nhắn từ chính account này
              actionId: '',
              msgId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              cliMsgId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              uidFrom: account!.userZaloId || '',
              idTo: friendZaloId,
              dName: friend?.displayName || friend?.zaloName || '',
              ts: Date.now().toString(),
              status: 0,
              content: message,
              conversationId: conversation.id,
              messageStatus: 'failed',
              source: 'backend',
              senderId: account!.userId || undefined,
              isRead: 1,
            });

            await this.messageRepository.save(failedMessage);
          }
        }
      } catch (saveError) {
        // Log lỗi khi lưu message failed nhưng không throw để không che giấu lỗi gốc
        console.error('Error saving failed message to database:', saveError);
      }

      throw new BadRequestException('Gửi tin nhắn thất bại: ' + error.message);
    }
  }

  async sendMessageWithAttachments(
    accountId: number,
    friendZaloId: string,
    attachments: any[],
  ) {
    try {
      // Sử dụng SocketService để gọi sang zalo-listener thay vì tạo instance mới
      return await this.socketService.sendMessageWithAttachments(
        accountId,
        friendZaloId,
        attachments,
      );
    } catch (error) {
      throw new BadRequestException('Gửi tin nhắn thất bại: ' + error.message);
    }
  }

  async sendMessageWithVideo(
    accountId: number,
    friendZaloId: string,
    file: Express.Multer.File,
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      const videoUrl = this.uploadService.uploadLocal(file);

      const result = await api.sendVideo(
        {
          msg: '',
          videoUrl,
          thumbnailUrl: `${process.env.BASE_URL}/uploads/thumbnails/dainganha.png`,
        },
        friendZaloId,
        ThreadType.User,
      );

      return { success: true, result };
    } catch (error) {
      throw new BadRequestException('Gửi tin nhắn thất bại: ' + error.message);
    }
  }

  async pinConversation(accountId: number, threadId: string, isPinned: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });
      const result = await api.setPinnedConversations(
        isPinned === 1 ? true : false,
        threadId,
        ThreadType.User,
      );
      return { success: true, result };
    } catch (error) {
      throw new BadRequestException('Gửi tin nhắn thất bại: ' + error.message);
    }
  }

  async sendSeenEvent(
    accountId: number,
    type: ThreadType,
    messages: SendSeenEventMessageParams[],
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });
      const result = await api.sendSeenEvent(messages, type);
      return { success: true, result };
    } catch (error) {
      throw new BadRequestException('Gửi tin nhắn thất bại: ' + error.message);
    }
  }

  async sendReaction(
    accountId: number,
    threadId: string,
    type: number,
    msgId: string,
    cliMsgId: string,
    emoji: string,
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      const addReactionDestination = {
        data: { msgId, cliMsgId },
        threadId,
        type,
      };

      await api.addReaction(emoji as Reactions, addReactionDestination);

      return { success: true, message: 'Reaction feature not yet implemented' };
    } catch (error) {
      throw new BadRequestException('Gửi reaction thất bại: ' + error.message);
    }
  }

  async undoMessage(
    accountId: number,
    threadId: string,
    type: ThreadType,
    msgId: string,
    cliMsgId: string,
  ) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      const undoOptions = {
        msgId,
        cliMsgId,
      };

      await api.undo(undoOptions, threadId, type);

      return { success: true, message: 'Undo feature not yet implemented' };
    } catch (error) {
      throw new BadRequestException('Undo thất bại: ' + error.message);
    }
  }

  async parseLink(accountId: number, url: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;
    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }
    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });
    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      return await api.parseLink(url);
    } catch (error) {
      throw new BadRequestException('Gửi reaction thất bại: ' + error.message);
    }
  }

  async sendSticker(accountId: number, friendZaloId: string, stickerData: any) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      // Force error (test): luôn ném lỗi để kiểm thử
      // if (true) {
      //   throw new Error('Test error: Force send sticker to fail');
      // }

      const result = await api.sendSticker(
        stickerData,
        friendZaloId,
        ThreadType.User,
      );

      try {
        const res: any = result as any;
        const friend = await this.friendRepository.findOne({
          where: [
            { accountId, userId: friendZaloId },
            { accountId, userKey: friendZaloId },
          ],
        });

        if (friend) {
          const friendId = friend?.id;
          if (friendId) {
            const conversation =
              await this.conversationService.getConversationByFriendIdAndAccountId(
                friendId as number,
                accountId,
              );

            if (conversation && result) {
              const generatedId = `sent_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;
              const msgId =
                res?.message?.msgId ||
                res?.msgId ||
                res?.globalMsgId ||
                generatedId;
              const cliMsgId = res?.cliMsgId || generatedId;

              // Delay 500ms để tránh race condition với socket listener
              // Socket có thể đang insert message vào database cùng lúc
              await new Promise((resolve) => setTimeout(resolve, 500));

              // Kiểm tra xem message đã tồn tại chưa dựa vào msgId và isSelf
              const existingMessage = await this.messageRepository.findOne({
                where: { msgId, isSelf: 1 },
              });

              if (existingMessage) {
                // Message đã tồn tại, bỏ qua không lưu lại
                console.log(
                  `[DEBUG] Sticker message with msgId ${msgId} and isSelf=1 already exists, skipping save`,
                );
              } else {
                const sentMessage = this.messageRepository.create({
                  type: ThreadType.User as any,
                  threadId: friendZaloId,
                  isSelf: 1,
                  actionId: (res?.actionId as any) || '',
                  msgId,
                  cliMsgId,
                  uidFrom: account!.userZaloId || '',
                  idTo: friendZaloId,
                  dName: friend?.displayName || friend?.zaloName || '',
                  ts: (res?.ts
                    ? String(res?.ts)
                    : Date.now().toString()) as any,
                  status: (res?.status ?? 0) as any,
                  content: '[Non-text content]',
                  conversationId: conversation.id,
                  messageStatus: 'sent',
                  source: 'backend',
                  senderId: account!.userId || undefined,
                  isRead: 1,
                  msgType: 'chat.sticker',
                  stickerId: stickerData?.id,
                  cateId: stickerData?.cateId,
                  stickerType: stickerData?.type,
                  stickerUrl: stickerData?.stickerUrl,
                  stickerSpriteUrl: stickerData?.stickerSpriteUrl,
                  stickerWebpUrl: stickerData?.stickerWebpUrl,
                  contentJson: JSON.stringify({
                    id: stickerData?.id,
                    cateId: stickerData?.cateId,
                    type: stickerData?.type,
                    stickerUrl: stickerData?.stickerUrl,
                    stickerSpriteUrl: stickerData?.stickerSpriteUrl,
                    stickerWebpUrl: stickerData?.stickerWebpUrl,
                  }),
                });

                await this.messageRepository.save(sentMessage);
              }
            }
          }
        }
      } catch (saveError) {
        console.error(
          'Error saving sent sticker message to database:',
          saveError,
        );
      }

      return result;
    } catch (error) {
      // Lưu message 'failed' vào DB nếu gửi sticker thất bại
      try {
        const friend = await this.friendRepository.findOne({
          where: [
            { accountId, userId: friendZaloId },
            { accountId, userKey: friendZaloId },
          ],
        });

        if (friend) {
          const friendId2 = friend?.id;
          if (friendId2) {
            const conversation =
              await this.conversationService.getConversationByFriendIdAndAccountId(
                friendId2 as number,
                accountId,
              );

            if (conversation) {
              const failedMessage = this.messageRepository.create({
                type: ThreadType.User as any,
                threadId: friendZaloId,
                isSelf: 1,
                actionId: '',
                msgId: `failed_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                cliMsgId: `failed_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                uidFrom: account!.userZaloId || '',
                idTo: friendZaloId,
                dName: friend?.displayName || friend?.zaloName || '',
                ts: Date.now().toString(),
                status: 0,
                content: '',
                conversationId: conversation.id,
                messageStatus: 'failed',
                source: 'backend',
                senderId: account!.userId || undefined,
                isRead: 1,
                msgType: 'chat.sticker',
                stickerId: stickerData?.id,
                cateId: stickerData?.cateId,
                stickerType: stickerData?.type,
                stickerUrl: stickerData?.stickerUrl,
                stickerSpriteUrl: stickerData?.stickerSpriteUrl,
                stickerWebpUrl: stickerData?.stickerWebpUrl,
                contentJson: JSON.stringify({
                  id: stickerData?.id,
                  cateId: stickerData?.cateId,
                  type: stickerData?.type,
                  stickerUrl: stickerData?.stickerUrl,
                  stickerSpriteUrl: stickerData?.stickerSpriteUrl,
                  stickerWebpUrl: stickerData?.stickerWebpUrl,
                }),
              });

              await this.messageRepository.save(failedMessage);
            }
          }
        }
      } catch (saveError) {
        console.error(
          'Error saving failed sticker message to database:',
          saveError,
        );
      }

      throw new BadRequestException(
        'Gửi sticker thất bại: ' + (error as any).message,
      );
    }
  }

  async getStickers(accountId: number, keyword: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      const stickerIDs = await api.getStickers(keyword);
      let stickers: any[] = [];
      if (stickerIDs?.length > 0) {
        const details = await api.getStickersDetail(stickerIDs);
        stickers = details.map((s: any) => ({
          id: s.id,
          stickerId: s.id,
          stickerUrl: s.stickerUrl,
          stickerSpriteUrl: s.stickerSpriteUrl,
          stickerWebpUrl: s.stickerWebpUrl,
          totalFrames: s.totalFrames,
          duration: s.duration,
          type: s.type,
          cateId: s.cateId,
        }));
      }
      return {
        data: stickers,
      };
    } catch (error) {
      throw new BadRequestException('Lấy stickers thất bại: ' + error.message);
    }
  }

  async acceptFriendRequest(accountId: number, userId: string, sub: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      await api.acceptFriendRequest(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async undoSentFriendRequest(accountId: number, userId: string, sub: number) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      await api.undoFriendRequest(userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendFriendRequest(accountId: number, friendId: number, userId: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      await api.sendFriendRequest('', userId);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async scanPhoneNumber(
    accountId: number,
    phoneNumber: string,
  ): Promise<{
    avatar: string;
    cover: string;
    status: string;
    gender: number;
    dob: number;
    sdob: string;
    globalId: string;
    bizPkg: any;
    uid: string;
    zalo_name: string;
    display_name: string;
  } | null> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });

    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const { cookies, imei, userAgent } = account;

    if (!cookies) {
      throw new BadRequestException('Cookies not found for this account');
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === 'string' ? JSON.parse(cookies) : cookies;
    } catch (error) {
      throw new BadRequestException('Invalid cookies format');
    }

    const zalo = new Zalo({
      selfListen: false,
      checkUpdate: true,
      logging: false,
    });

    try {
      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      // Normalize phone number (remove +84, ensure starts with 84 or 0)
      const normalizedPhone = phoneNumber.replace(/^\+84/, '84');

      const result = await api.findUser(normalizedPhone);

      return result;
    } catch (error) {
      // If user not found, return null instead of throwing
      if (
        error.message?.includes('not found') ||
        error.message?.includes('404')
      ) {
        return null;
      }
      throw new BadRequestException(
        `Lỗi khi quét số điện thoại: ${error.message}`,
      );
    }
  }
}
