import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ThreadType, Zalo } from "zca-js";
import { DatabaseService } from "../database/database.service";
import { Account } from "@/entities/account.entity";
import { SocketGateway } from "../socket/socket.gateway";
import { Friend } from "@/entities/friend.entity";
import * as fs from "fs";
import * as path from "path";

interface ZaloInstance {
  zalo: Zalo;
  api: any;
  accountId: number;
  userId: number;
  isConnected: boolean;
  lastConnectionCheck: number;
}

@Injectable()
export class ZaloListenerService implements OnModuleInit, OnModuleDestroy {
  private zaloInstances: Map<string, ZaloInstance> = new Map();
  private isRunning = false;
  private connectionCheckInterval: NodeJS.Timeout;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly socketGateway: SocketGateway
  ) {}

  async onModuleInit() {
    await this.startGlobalListener();
  }

  async onModuleDestroy() {
    await this.stopGlobalListener();
  }

  async startGlobalListener() {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      const accounts = await this.databaseService.getAccounts();
      console.log(`[DEBUG] Total accounts found: ${accounts.length}`);

      const accountsWithCredentials = accounts.filter(
        (account) => account.cookies && account.imei && account.userAgent
      );

      for (const account of accountsWithCredentials) {
        await this.initializeAccountListener(account);
      }

      this.connectionCheckInterval = setInterval(async () => {
        await this.checkConnectionsAndUpdateAccounts();
      }, 900000);
    } catch (error) {
      console.error("[DEBUG] Error in startGlobalListener:", error);
      this.isRunning = false;
    }
  }

  async stopGlobalListener() {
    this.isRunning = false;

    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    for (const [accountId, instance] of this.zaloInstances) {
      try {
        if (instance.api && instance.api.listener) {
          instance.api.listener.removeAllListeners();
        }
        if (instance.zalo) {
        }
      } catch (error) {}
    }

    this.zaloInstances.clear();
  }

  async checkAccountConnection(account: Account): Promise<boolean> {
    const { cookies, imei, userAgent } = account;

    if (!cookies || !imei || !userAgent) {
      return false;
    }

    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === "string" ? JSON.parse(cookies) : cookies;
    } catch (error) {
      return false;
    }

    try {
      const zalo = new Zalo({ logging: false });

      await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  private async initializeAccountListener(account: Account) {
    if (
      this.zaloInstances.has(this.createInstanceKey(account.id, account.userId))
    ) {
      console.log(
        `[DEBUG] Account ${account.id} already has an instance, skipping`
      );
      return;
    }

    const isConnected = await this.checkAccountConnection(account);

    if (!isConnected) {
      console.log(
        `[DEBUG] Account ${account.id} failed connection check, skipping`
      );
      return;
    }

    const { cookies, imei, userAgent } = account;
    let parsedCookies;
    try {
      parsedCookies =
        typeof cookies === "string" ? JSON.parse(cookies) : cookies;
    } catch (error) {
      console.log(
        `[DEBUG] Failed to parse cookies for account ${account.id}:`,
        error
      );
      return;
    }

    try {
      const zalo = new Zalo({
        selfListen: true,
        checkUpdate: false,
        logging: false,
      });

      const api = await zalo.login({
        cookie: parsedCookies,
        imei,
        userAgent,
      });

      console.log(
        `[DEBUG] Successfully logged in account ${account.id}, setting up listener...`
      );

      this.zaloInstances.set(
        this.createInstanceKey(account.id, account.userId),
        {
          zalo,
          api,
          accountId: account.id,
          userId: account.userId,
          isConnected: true,
          lastConnectionCheck: Date.now(),
        }
      );

      this.setupMessageListener(
        account.id,
        account.userId,
        api,
        account.userZaloId
      );

      await this.databaseService.updateAccountConnection(account.id, true);

      console.log(
        `[DEBUG] Account ${account.id} listener setup completed successfully`
      );
    } catch (error) {
      console.error(`[DEBUG] Error initializing account ${account.id}:`, error);
      await this.handleConnectionError(account.id, error.message);
    }
  }

  private setupMessageListener(
    accountId: number,
    userId: number,
    api: any,
    userZaloId: string
  ) {
    if (!api || !api.listener) {
      console.log(
        `[DEBUG] No API or listener available for account ${accountId}`
      );
      return;
    }

    console.log(
      `[DEBUG] Setting up message listener for account ${accountId} (${userId})`
    );

    api.listener.start();

    api.listener.on("message", async (message) => {
      try {
        if (message.type !== ThreadType.User) return;

        const { isSelf, data } = message;
        const { uidFrom, msgType, content } = data;

        // Chặn nhận QR ngân hàng
        if (msgType === "chat.webcontent") {
          return;
        }

        // Chỉ lấy thông tin bạn bè khi là tin nhắn từ người khác
        if (!isSelf) {
          const userInfo = await api.getUserInfo(uidFrom);
          const firstProfile = Object.values(
            userInfo.changed_profiles
          )?.[0] as any;
          const userKey = firstProfile?.userKey;

          // Chỉ lưu bạn mới nếu chưa tồn tại
          let friend = await this.databaseService.findFriendByUserKey(userKey);
          if (!friend) {
            friend = this.createFriendFromProfile(accountId, firstProfile);
            await this.databaseService.saveFriend(friend);
            await this.databaseService.saveConversation({
              account_id: accountId,
              friend_id: friend.id,
              userKey: friend.userKey,
              userZaloId,
              isFr: 0,
            });
          }
        }

        // Xử lý sticker nếu có
        let stickerDetail;
        if (msgType === "chat.sticker" && content?.id) {
          stickerDetail = await api.getStickersDetail(content.id);

          if (stickerDetail && stickerDetail[0]) {
            const sticker = stickerDetail[0];
            const existingSticker =
              await this.databaseService.findStickerByStickerIdAndCateIdAndType(
                sticker.id,
                sticker.cateId,
                sticker.type
              );

            if (!existingSticker) {
              const newSticker = await this.databaseService.saveSticker({
                stickerId: sticker.id,
                cateId: sticker.cateId,
                type: sticker.type,
                stickerUrl: sticker.stickerUrl,
                stickerSpriteUrl: sticker.stickerSpriteUrl,
                stickerWebpUrl: sticker.stickerWebpUrl,
                totalFrames: sticker.totalFrames,
                duration: sticker.duration,
              });
              console.log(`[DEBUG] Saved new sticker: ${newSticker.id}`);
            } else {
              console.log(
                `[DEBUG] Sticker already exists: ${existingSticker.id}`
              );
            }
          }
        }

        // Chuẩn hóa dữ liệu message
        const isPlainText = typeof content === "string";
        const sticker = stickerDetail?.[0];

        let parsedParams: Record<string, any> = {};
        if (content?.params) {
          try {
            parsedParams = JSON.parse(content.params) || {};
          } catch (e) {
            parsedParams = {};
          }
        }

        const quote = data?.quote ?? {};

        let foundMessage = null;
        if (quote.ownerId) {
          const candidates = [
            [data.uidFrom, data.idTo],
            [data.idTo, data.uidFrom],
          ];

          for (const [from, to] of candidates) {
            foundMessage =
              await this.databaseService.findMessageByMsgIdAndThreadIdAndUidFromAndIdToAndQuote(
                quote.globalMsgId,
                quote.cliMsgId,
                from,
                to
              );
            if (foundMessage) break;
          }
        }

        const messageData = {
          type: message.type,
          threadId: message.threadId,
          isSelf,
          msgType,
          cmd: data.cmd,
          st: data.st,
          at: data.at,
          actionId: data.actionId,
          msgId: data.msgId,
          cliMsgId: data.cliMsgId,
          uidFrom: data.uidFrom,
          idTo: data.idTo,
          dName: data.dName,
          ts: data.ts,
          status: data.status,
          content: isPlainText ? content : "[Non-text content]",
          title: content?.title,
          description: content?.description,
          href: content?.href,
          thumb: content?.thumb,
          childnumber: content?.childnumber,
          action: content?.action,
          params: content?.params,
          stickerId: sticker?.id,
          cateId: sticker?.cateId,
          stickerType: sticker?.type,
          stickerUrl: sticker?.stickerUrl,
          stickerSpriteUrl: sticker?.stickerSpriteUrl,
          stickerWebpUrl: sticker?.stickerWebpUrl,
          totalFrames: sticker?.totalFrames,
          duration: sticker?.duration,
          fileSize: parsedParams.fileSize || "",
          checkSum: parsedParams.checksum || "",
          checksumSha: parsedParams.checksumSha || "",
          fileExt: parsedParams.fileExt || "",
          fdata: parsedParams.fdata || "",
          fType: parsedParams.fType || 0,
          tWidth: parsedParams.tWidth || 0,
          tHeight: parsedParams.tHeight || 0,
          videoDuration: parsedParams?.duration,
          vWidth: parsedParams?.video_width,
          vHeight: parsedParams?.video_height,
          quoteOwnerId: quote.ownerId?.toString() || null,
          quoteCliMsgId: quote.cliMsgId?.toString() || null,
          quoteGlobalMsgId: quote.globalMsgId?.toString() || null,
          quoteCliMsgType: quote.cliMsgType ?? null,
          quoteTs: quote.ts?.toString() || null,
          quoteMsg: quote.msg || "",
          quoteAttach: quote.attach || "",
          quoteFromD: quote.fromD || "",
          quoteTtl: quote.ttl ?? null,
          replyToId: foundMessage?.id ?? null,
          replyTo: foundMessage,
          contentJson: JSON.stringify(content),
          propertyExtJson: JSON.stringify(data?.propertyExt ?? {}),
          ttl: data?.ttl,
        };

        await this.handleMessageInsertion(accountId, userId, messageData);
      } catch (error) {
        console.error(
          `[ZaloListener] Error processing message for account ${accountId}:`,
          error
        );
      }
    });

    api.listener.on("upload_attachment", (attachment) => {
      console.log("Upload Attachment:", attachment);
    });

    api.listener.on("friend_event", async (event) => {
      // 0: Chấp nhận lời mời kết bạn (2)
      // 1: Xóa bạn (2)
      // 2: Gời lời mời kết bạn (2)
      // 3: Thu hồi lời mời kết bạn (2)
      // 4: Từ chối lời mời kết bạn (2)
      // 5: Bỏ qua lời mời kết bạn (1)
      // {
      //   type: 2,
      //   data: {
      //     toUid: '6511796297618351373',
      //     fromUid: '2155359264481580474',
      //     src: 30,
      //     message: 'Xin chào, mình là Phạm Cảnh Dinh. Kết bạn với
      // mình nhé!'
      //   },
      //   threadId: '6511796297618351373',
      //   isSelf: true
      // } event
      // {
      //   type: 2,
      //   data: {
      //     toUid: '691777959878604462',
      //     fromUid: '5633549637403624985',
      //     src: 30,
      //     message: 'Xin chào, mình là Phạm Cảnh Dinh. Kết bạn với
      // mình nhé!'
      //   },
      //   threadId: '691777959878604462',
      //   isSelf: false
      // }
      // console.log(event, "event");

      if (event.type === 2) {
        if (event.isSelf) {
          const conversation =
            await this.databaseService.findConversationByUserZaloIdAndUserKeyAndUpdateIsFr(
              event.data.fromUid,
              event.data.toUid,
              2
            );
          this.socketGateway.sendStatusFriendEventToAccount(accountId, {
            isFr: 2,
            conversationId: conversation?.id,
          });
        } else {
          const conversation =
            await this.databaseService.findConversationByUserZaloIdAndUserKeyAndUpdateIsFr(
              event.data.toUid,
              event.data.fromUid,
              3
            );
          this.socketGateway.sendStatusFriendEventToAccount(accountId, {
            isFr: 3,
            conversationId: conversation?.id,
          });
        }
      }
    });

    api.listener.on("seen_messages", (data) => {
      const msgIds = [
        ...new Set(data.map((item) => item.data.msgId).filter(Boolean)),
      ] as string[];

      if (msgIds.length > 0) {
        this.updateMessagesAsRead(msgIds);
      }
    });

    api.listener.on("reaction", async (reaction) => {
      const rMsgArr = reaction?.data?.content?.rMsg;
      const gMsgID = rMsgArr?.[0]?.gMsgID;
      const { threadId, data } = reaction || {};
      const { uidFrom, idTo } = data || {};

      if (!gMsgID || !threadId || !uidFrom || !idTo) return;

      // Thử tìm message với cả hai chiều uidFrom <-> idTo
      const candidates = [
        [uidFrom, idTo],
        [idTo, uidFrom],
      ];

      let foundMessage = null;
      for (const [from, to] of candidates) {
        foundMessage =
          await this.databaseService.findMessageByMsgIdAndThreadIdAndUidFromAndIdTo(
            gMsgID,
            threadId,
            from,
            to
          );
        if (foundMessage) break;
      }

      if (!foundMessage) return;

      const { rType, rIcon, msgSender, rMsg } = reaction.data.content;
      const { cMsgID } = rMsg?.[0];

      if (rIcon && rType != -1) {
        await this.handleReactionInsertion(accountId, reaction, foundMessage);
      } else {
        await this.databaseService.deleteReactionsByMsgIdAndDnameOrMsgSender(
          gMsgID,
          cMsgID,
          threadId,
          reaction.data.dName,
          msgSender
        );

        const socketReactionData = {
          messageId: foundMessage.id,
          conversationId: foundMessage.conversationId,
          action: "remove" as const,
        };

        this.socketGateway.sendReactionToAccount(accountId, socketReactionData);
      }
    });

    api.listener.on("undo", async (undo) => {
      try {
        const globalMsgId = undo?.data?.content?.globalMsgId;
        const cliMsgId = undo?.data?.content?.cliMsgId;
        const uIdFrom = undo?.data?.uidFrom;
        const idTo = undo?.data?.idTo;

        const message =
          await this.databaseService.findMessageByGlobalMsgIdAndCliMsgIdAndUpdateUndo(
            globalMsgId,
            cliMsgId,
            uIdFrom,
            idTo
          );

        await this.socketGateway.sendUndoToAccount(
          accountId,
          message?.conversationId
        );
      } catch (error) {
        console.log(error);
      }
    });

    api.listener.on("error", async (error: any) => {
      console.log(`[DEBUG] Listener error for account ${accountId}:`, error);
      await this.handleConnectionError(
        accountId,
        error.message || "Unknown error"
      );
    });

    api.listener.on("disconnect", async () => {
      console.log(`[DEBUG] Listener disconnected for account ${accountId}`);
      await this.handleConnectionError(accountId, "Socket disconnected");
    });

    console.log(`[DEBUG] Message listener started for account ${accountId}`);
  }

  private async handleConnectionError(accountId: number, reason?: string) {
    // Find instance by accountId (we need to iterate to find the correct instance)
    for (const [key, instance] of this.zaloInstances) {
      if (instance.accountId === accountId) {
        instance.isConnected = false;
        instance.lastConnectionCheck = Date.now();
        await this.databaseService.updateAccountConnection(accountId, false);
        break;
      }
    }
  }

  public async checkConnectionsAndUpdateAccounts() {
    try {
      const accounts = await this.databaseService.getAccounts();
      const accountsWithCredentials = accounts.filter(
        (account) => account.cookies && account.imei && account.userAgent
      );

      for (const account of accountsWithCredentials) {
        const key = this.createInstanceKey(account.id, account.userId);
        if (!this.zaloInstances.has(key)) {
          await this.initializeAccountListener(account);
        } else {
          const instance = this.zaloInstances.get(key);
          if (instance && !instance.isConnected) {
            const isConnected = await this.checkAccountConnection(account);
            if (isConnected) {
              await this.initializeAccountListener(account);
            }
          }
        }
      }

      // Check for instances that no longer exist in database
      for (const [key, instance] of this.zaloInstances) {
        const accountExists = accountsWithCredentials.find(
          (account) =>
            account.id === instance.accountId &&
            account.userId === instance.userId
        );
        if (!accountExists) {
          await this.removeAccountInstance(key);
        }
      }
    } catch (error) {}
  }

  private async removeAccountInstance(key: string) {
    const instance = this.zaloInstances.get(key);
    if (instance) {
      try {
        if (instance.api && instance.api.listener) {
          instance.api.listener.removeAllListeners();
        }
      } catch (error) {}
    }

    this.zaloInstances.delete(key);

    if (instance) {
      await this.databaseService.updateAccountConnection(
        instance.accountId,
        false
      );
    }
  }

  private async handleMessageInsertion(
    accountId: number,
    userId: number,
    messageData: any
  ) {
    try {
      // Check if message already exists
      const existingMessage = await this.databaseService.findMessageByMsgId(
        messageData.msgId,
        messageData.isSelf
      );

      if (existingMessage) {
        console.log(
          `[DEBUG] Message with msgId ${messageData.msgId} already exists, updating with latest data`
        );

        // Update message với dữ liệu mới nhất từ socket
        existingMessage.type = messageData.type;
        existingMessage.threadId = messageData.threadId;
        existingMessage.isSelf = messageData.isSelf ? 1 : 0;
        existingMessage.actionId = messageData.actionId;
        existingMessage.cliMsgId = messageData.cliMsgId;
        existingMessage.uidFrom = messageData.uidFrom;
        existingMessage.idTo = messageData.idTo;
        existingMessage.dName = messageData.dName;
        existingMessage.msgType = messageData.msgType;
        existingMessage.cmd = messageData.cmd;
        existingMessage.st = messageData.st;
        existingMessage.at = messageData.at;
        existingMessage.ts = messageData.ts;
        existingMessage.status = messageData.status;
        existingMessage.messageStatus = "sent";
        existingMessage.source = "socket";
        existingMessage.content = messageData.content;
        existingMessage.title = messageData.title;
        existingMessage.description = messageData.description;
        existingMessage.href = messageData.href;
        existingMessage.thumb = messageData.thumb;
        existingMessage.childnumber = messageData.childnumber;
        existingMessage.action = messageData.action;
        existingMessage.params = messageData.params;
        existingMessage.senderId = messageData.isSelf ? userId : null;
        existingMessage.isRead = !messageData.isSelf ? 0 : 2;
        existingMessage.stickerId = messageData.stickerId;
        existingMessage.cateId = messageData.cateId;
        existingMessage.stickerType = messageData.stickerType;
        existingMessage.stickerUrl = messageData.stickerUrl;
        existingMessage.stickerSpriteUrl = messageData.stickerSpriteUrl;
        existingMessage.stickerWebpUrl = messageData.stickerWebpUrl;
        existingMessage.stickerTotalFrames = messageData?.totalFrames;
        existingMessage.stickerDuration = messageData?.duration;
        existingMessage.fileSize = messageData?.fileSize;
        existingMessage.checkSum = messageData?.checkSum;
        existingMessage.checksumSha = messageData?.checksumSha;
        existingMessage.fileExt = messageData?.fileExt;
        existingMessage.fdata = messageData?.fdata;
        existingMessage.fType = messageData?.fType;
        existingMessage.tWidth = messageData?.tWidth;
        existingMessage.tHeight = messageData?.tHeight;
        existingMessage.videoDuration = messageData?.videoDuration;
        existingMessage.vWidth = messageData?.vWidth;
        existingMessage.vHeight = messageData?.vHeight;
        existingMessage.quoteOwnerId = messageData?.quoteOwnerId;
        existingMessage.quoteCliMsgId = messageData?.quoteCliMsgId;
        existingMessage.quoteGlobalMsgId = messageData?.quoteGlobalMsgId;
        existingMessage.quoteCliMsgType = messageData?.quoteCliMsgType;
        existingMessage.quoteTs = messageData?.quoteTs;
        existingMessage.quoteMsg = messageData?.quoteMsg;
        existingMessage.quoteAttach = messageData?.quoteAttach;
        existingMessage.quoteFromD = messageData?.quoteFromD;
        existingMessage.quoteTtl = messageData?.quoteTtl;
        existingMessage.replyToId = messageData?.replyToId;
        existingMessage.contentJson = messageData?.contentJson;
        existingMessage.propertyExtJson = messageData?.propertyExtJson;
        existingMessage.ttl = messageData?.ttl;

        await this.databaseService.updateMessage(existingMessage);

        // Send updated message via socket
        const socketMessageData = {
          conversationId: existingMessage.conversationId,
          ...existingMessage,
          messageStatus: "sent" as const,
          isSelf: messageData.isSelf,
          time: existingMessage.createdAt,
        };
        this.socketGateway.sendNewMessageToAccount(
          accountId,
          socketMessageData
        );

        return;
      }

      let conversationId: number | null = null;

      if (messageData.isSelf) {
        // If isSelf is true, find conversation with userZaloId = uidFrom, userKey = idTo
        const conversation =
          await this.databaseService.findConversationByAccountIdAndUserZaloIdAndUserKey(
            accountId,
            messageData.uidFrom,
            messageData.idTo
          );
        conversationId = conversation?.id || null;
      } else {
        // If isSelf is false, find conversation with userZaloId = idTo, userKey = uidFrom
        const conversation =
          await this.databaseService.findConversationByAccountIdAndUserZaloIdAndUserKey(
            accountId,
            messageData.idTo,
            messageData.uidFrom
          );
        conversationId = conversation?.id || null;
      }

      if (!conversationId) {
        console.log(
          `[DEBUG] No conversation found for message ${messageData.msgId}, skipping`
        );
        return;
      }

      const newMessgae = await this.databaseService.createMessage({
        type: messageData.type,
        threadId: messageData.threadId,
        isSelf: messageData.isSelf ? 1 : 0,
        actionId: messageData.actionId,
        msgId: messageData.msgId,
        cliMsgId: messageData.cliMsgId,
        uidFrom: messageData.uidFrom,
        idTo: messageData.idTo,
        dName: messageData.dName,
        msgType: messageData.msgType,
        cmd: messageData.cmd,
        st: messageData.st,
        at: messageData.at,
        ts: messageData.ts,
        status: messageData.status,
        messageStatus: "sent",
        source: "socket",
        content: messageData.content,
        title: messageData.title,
        description: messageData.description,
        href: messageData.href,
        thumb: messageData.thumb,
        childnumber: messageData.childnumber,
        action: messageData.action,
        params: messageData.params,
        conversationId: conversationId,
        senderId: messageData.isSelf ? userId : null,
        isRead: !messageData.isSelf ? 0 : 2,
        stickerId: messageData.stickerId,
        cateId: messageData.cateId,
        stickerType: messageData.stickerType,
        stickerUrl: messageData.stickerUrl,
        stickerSpriteUrl: messageData.stickerSpriteUrl,
        stickerWebpUrl: messageData.stickerWebpUrl,
        stickerTotalFrames: messageData?.totalFrames,
        stickerDuration: messageData?.duration,
        fileSize: messageData?.fileSize,
        checkSum: messageData?.checkSum,
        checksumSha: messageData?.checksumSha,
        fileExt: messageData?.fileExt,
        fdata: messageData?.fdata,
        fType: messageData?.fType,
        tWidth: messageData?.tWidth,
        tHeight: messageData?.tHeight,
        videoDuration: messageData?.videoDuration,
        vWidth: messageData?.vWidth,
        vHeight: messageData?.vHeight,
        quoteOwnerId: messageData?.quoteOwnerId,
        quoteCliMsgId: messageData?.quoteCliMsgId,
        quoteGlobalMsgId: messageData?.quoteGlobalMsgId,
        quoteCliMsgType: messageData?.quoteCliMsgType,
        quoteTs: messageData?.quoteTs,
        quoteMsg: messageData?.quoteMsg,
        quoteAttach: messageData?.quoteAttach,
        quoteFromD: messageData?.quoteFromD,
        quoteTtl: messageData?.quoteTtl,
        replyToId: messageData?.replyToId,
        replyTo: messageData?.replyTo,
        contentJson: messageData?.contentJson,
        propertyExtJson: messageData?.propertyExtJson,
        ttl: messageData?.ttl,
      });

      console.log(
        `[DEBUG] Successfully inserted message ${messageData.msgId} for conversation ${conversationId}`
      );

      // Send message to connected clients via socket
      const socketMessageData = {
        conversationId,
        ...newMessgae,
        messageStatus: "sent" as const,
        isSelf: messageData.isSelf,
        time: newMessgae.createdAt,
      };

      // Send to specific account
      this.socketGateway.sendNewMessageToAccount(accountId, socketMessageData);
    } catch (error) {
      console.error(
        `[DEBUG] Error handling message insertion for account ${accountId}:`,
        error
      );
    }
  }

  async getListenerStatus() {
    const instancesInfo = Array.from(this.zaloInstances.entries()).map(
      ([key, instance]) => ({
        key,
        accountId: instance.accountId,
        userId: instance.userId,
        isConnected: instance.isConnected,
        lastConnectionCheck: new Date(
          instance.lastConnectionCheck
        ).toISOString(),
        hasApi: !!instance.api,
        hasListener: !!(instance.api && instance.api.listener),
      })
    );

    return {
      isRunning: this.isRunning,
      connectedAccounts: Array.from(this.zaloInstances.values()).map(
        (instance) => instance.accountId
      ),
      totalInstances: this.zaloInstances.size,
      instancesInfo,
    };
  }

  async restartListener() {
    await this.stopGlobalListener();
    await this.startGlobalListener();
    return { message: "Listener restarted successfully" };
  }

  // Helper method to create combined key
  private createInstanceKey(accountId: number, userId: number): string {
    return `${accountId}_${userId}`;
  }

  private async updateMessagesAsRead(msgIds: string[]) {
    try {
      await this.databaseService.updateMessagesAsRead(msgIds);
      console.log(`[DEBUG] Messages updated as read successfully`);
    } catch (error) {
      console.error(`[DEBUG] Error updating messages as read:`, error);
    }
  }

  private createFriendFromProfile(accountId: number, profile: any): Friend {
    const friend = new Friend();
    friend.accountId = accountId;
    friend.userId = profile.userId;
    friend.username = profile.username;
    friend.displayName = profile.displayName;
    friend.zaloName = profile.zaloName;
    friend.avatar = profile.avatar;
    friend.bgavatar = profile.bgavatar;
    friend.cover = profile.cover;
    friend.gender = profile.gender;
    friend.dob = profile.dob;
    friend.sdob = profile.sdob;
    friend.status = profile.status;
    friend.phoneNumber = profile.phoneNumber;
    friend.isFr = profile.isFr;
    friend.isBlocked = profile.isBlocked;
    friend.lastActionTime = profile.lastActionTime;
    friend.lastUpdateTime = profile.lastUpdateTime;
    friend.isActive = profile.isActive;
    friend.friendKey = profile.key;
    friend.type = profile.type;
    friend.isActivePC = profile.isActivePC;
    friend.isActiveWeb = profile.isActiveWeb;
    friend.isValid = profile.isValid;
    friend.userKey = profile.userKey;
    friend.accountStatus = profile.accountStatus;
    friend.oaInfo = profile.oaInfo;
    friend.user_mode = profile.user_mode;
    friend.globalId = profile.globalId;
    friend.bizPkg = profile.bizPkg;
    friend.createdTs = profile.createdTs;
    friend.oa_status = profile.oa_status;
    return friend;
  }

  // Thêm hàm xử lý lưu reaction đồng bộ
  private async handleReactionInsertion(
    accountId: number,
    reaction: any,
    foundMessage: any
  ) {
    const {
      actionId,
      msgId,
      cliMsgId,
      msgType,
      uidFrom: reactUidFrom,
      idTo: reactIdTo,
      content,
      ts,
      ttl,
      dName,
    } = reaction.data;
    const { rType, rIcon, msgSender, rMsg, source } = content;
    const { cMsgID, gMsgID } = rMsg?.[0] || {};
    const { threadId } = reaction;

    const react = {
      messageId: foundMessage.id,
      conversationId: foundMessage.conversationId,
      actionId,
      msgId,
      cliMsgId,
      msgType,
      uidFrom: reactUidFrom,
      idTo: reactIdTo,
      rType,
      rIcon,
      msgSender: msgSender ?? "", // Đảm bảo luôn có giá trị, nếu undefined/null thì truyền chuỗi rỗng
      rMsg,
      source,
      ts,
      ttl,
      threadId,
      cMsgID,
      gMsgID,
      dName,
      isSelf: reaction.isSelf ? 1 : 0,
      isRead: !reaction.isSelf ? 0 : 2,
    };
    await this.databaseService.saveReaction(react);

    // Send reaction via socket
    const socketReactionData = {
      messageId: foundMessage.id,
      conversationId: foundMessage.conversationId,
      action: "add" as const,
    };
    this.socketGateway.sendReactionToAccount(accountId, socketReactionData);
  }

  // Helper function để kiểm tra file là ảnh
  private isImageFile(filename: string): boolean {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".bmp",
      ".webp",
      ".svg",
    ];
    const ext = path.extname(filename).toLowerCase();
    return imageExtensions.includes(ext);
  }

  // Helper function để lưu file vào uploads và trả về thông tin file
  private saveFileToUploads(
    attachment: any,
    uploadsDir: string
  ): { filePath: string; fileName: string; fileUrl: string } | null {
    try {
      let fileBuffer: Buffer;
      let fileName: string;

      if (attachment.data && attachment.data.type === "Buffer") {
        fileBuffer = Buffer.from(attachment.data.data);
        fileName =
          attachment.filename ||
          `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else if (attachment.data instanceof Buffer) {
        fileBuffer = attachment.data;
        fileName =
          attachment.filename ||
          `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        console.warn(
          `[DEBUG] Skipping attachment with unsupported data type:`,
          attachment
        );
        return null;
      }

      // Tạo tên file unique với timestamp và random string
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const fileExt = path.extname(fileName) || "";
      const baseName = path.basename(fileName, fileExt);
      const uniqueFileName = `${baseName}_${timestamp}_${randomStr}${fileExt}`;
      const filePath = path.join(uploadsDir, uniqueFileName);

      // Lưu file
      fs.writeFileSync(filePath, fileBuffer);

      // Tạo URL từ biến môi trường
      const baseUrl =
        process.env.SOCKET_SERVER_URL ||
        `http://localhost:${process.env.PORT || 3001}`;
      const fileUrl = `${baseUrl}/uploads/${uniqueFileName}`;

      return {
        filePath,
        fileName: uniqueFileName,
        fileUrl,
      };
    } catch (fileError) {
      console.error(
        `[DEBUG] Error saving file ${attachment.filename}:`,
        fileError
      );
      return null;
    }
  }

  async sendMessageWithAttachments(
    accountId: number,
    friendZaloId: string,
    attachments: any[]
  ) {
    const instanceKey = this.findInstanceKeyByAccountId(accountId);
    if (!instanceKey) {
      throw new Error(`No active Zalo instance found for account ${accountId}`);
    }

    const instance = this.zaloInstances.get(instanceKey);
    if (!instance || !instance.api) {
      throw new Error(`Zalo API not available for account ${accountId}`);
    }

    // Get account from database
    const account = await this.databaseService.getAccountById(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }

    try {
      const formattedAttachments = attachments.map((attachment) => {
        if (attachment.data && attachment.data.type === "Buffer") {
          return {
            data: Buffer.from(attachment.data.data),
            filename: attachment.filename,
            metadata: attachment.metadata,
          };
        }
        return attachment;
      });

      // throw new Error(`Account not found: ${accountId}`);

      const result = await instance.api.sendMessage(
        {
          msg: "",
          attachments: formattedAttachments,
        },
        friendZaloId,
        ThreadType.User
      );

      // Khi gửi thành công: KHÔNG lưu gì vào database cả
      return {
        success: true,
        result,
      };
    } catch (error) {
      // CHỈ lưu file vào folder uploads khi CÓ LỖI
      // Khi gửi thành công thì KHÔNG lưu file vào folder uploads
      const savedFiles: Array<{
        filePath: string;
        fileName: string;
        fileUrl: string;
        isImage: boolean;
        fileSize: string;
        fileExt: string;
        title: string;
      }> = [];

      try {
        const uploadsDir = path.join(process.cwd(), "uploads");

        // Tạo folder uploads nếu chưa tồn tại
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Lưu từng file vào folder uploads
        for (const attachment of attachments) {
          const savedFile = this.saveFileToUploads(attachment, uploadsDir);
          if (savedFile) {
            const isImage = this.isImageFile(savedFile.fileName);

            // Extract file size
            let fileSize = "0";
            if (attachment.data && attachment.data.type === "Buffer") {
              fileSize = Buffer.from(attachment.data.data).length.toString();
            } else if (attachment.data instanceof Buffer) {
              fileSize = attachment.data.length.toString();
            } else if (attachment.metadata && attachment.metadata.size) {
              fileSize = attachment.metadata.size.toString();
            }

            // Extract file extension
            const fileExt =
              path.extname(attachment.filename || savedFile.fileName) || "";

            // Extract title (filename without extension)
            const fileName = attachment.filename || savedFile.fileName;
            const title = path.basename(fileName, fileExt) || fileName;

            savedFiles.push({
              ...savedFile,
              isImage,
              fileSize,
              fileExt: fileExt.replace(".", ""), // Remove leading dot
              title,
            });
          }
        }
      } catch (saveFileError) {
        console.error(
          "[DEBUG] Error saving files to uploads folder:",
          saveFileError
        );
      }

      // Lưu message 'failed' vào DB nếu gửi thất bại
      try {
        const friend =
          await this.databaseService.findFriendByUserIdOrUserKeyAndAccountId(
            accountId,
            friendZaloId
          );

        if (friend) {
          const conversation =
            await this.databaseService.findConversationByFriendIdAndAccountId(
              friend.id,
              accountId
            );

          if (conversation) {
            const messageRepository =
              this.databaseService.getMessageRepository();

            // Xác định msgType, href, thumb, title, size, fileExt dựa vào file đầu tiên
            const firstFile = savedFiles[0];
            let msgType = "share.file";
            let href = "";
            let thumb = "";
            let title = "";
            let fileSize = "";
            let fileExt = "";

            if (firstFile) {
              if (firstFile.isImage) {
                msgType = "chat.photo";
                href = firstFile.fileUrl;
                thumb = firstFile.fileUrl;
              } else {
                msgType = "share.file";
                href = firstFile.fileUrl;
                title = firstFile.title || "";
              }

              fileSize = firstFile.fileSize || "";
              fileExt = firstFile.fileExt || "";
            }

            // Tạo contentJson với thông tin về các file đã lưu
            const contentJson = JSON.stringify({
              files: savedFiles.map((file) => ({
                fileName: file.fileName,
                fileUrl: file.fileUrl,
                isImage: file.isImage,
                fileSize: file.fileSize,
                fileExt: file.fileExt,
                title: file.title,
              })),
              error: error.message,
              attachmentsCount: attachments.length,
            });

            // Tạo message với status 'failed'
            const failedMessage = await this.databaseService.createMessage({
              type: ThreadType.User as any,
              threadId: friendZaloId,
              isSelf: 1,
              actionId: "",
              msgId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              cliMsgId: `failed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              uidFrom: account.userZaloId || "",
              idTo: friendZaloId,
              dName: friend?.displayName || friend?.zaloName || "",
              ts: Date.now().toString(),
              status: 0,
              content: `Failed to send ${attachments.length} file(s). Files saved to uploads folder.`,
              conversationId: conversation.id,
              messageStatus: "failed",
              source: "backend",
              senderId: account.userId || undefined,
              isRead: 1,
              msgType: msgType,
              title: title,
              href: href,
              thumb: thumb,
              fileSize: fileSize,
              fileExt: fileExt,
              contentJson: contentJson,
            });

            await messageRepository.save(failedMessage);
            console.log(
              `[DEBUG] Saved failed message to database with ${savedFiles.length} files`
            );

            // Lưu thông tin file vào bảng failed_file_storage
            try {
              for (const savedFile of savedFiles) {
                // Extract path từ /uploads trở đi
                const relativePath = savedFile.fileUrl.includes("/uploads")
                  ? savedFile.fileUrl.substring(
                      savedFile.fileUrl.indexOf("/uploads")
                    )
                  : `/uploads/${savedFile.fileName}`;

                await this.databaseService.createFailedFileStorage({
                  messageId: failedMessage.id,
                  path: relativePath, // Chỉ lưu path từ /uploads trở đi
                });
              }
              console.log(
                `[DEBUG] Saved ${savedFiles.length} file(s) to failed_file_storage table`
              );
            } catch (failedFileStorageError) {
              // Log lỗi khi lưu failed file storage nhưng không throw để không che giấu lỗi gốc
              console.error(
                "Error saving failed file storage to database:",
                failedFileStorageError
              );
            }
          }
        }
      } catch (saveError) {
        // Log lỗi khi lưu message failed nhưng không throw để không che giấu lỗi gốc
        console.error("Error saving failed message to database:", saveError);
      }

      throw new Error(
        `Failed to send message with attachments: ${error.message}. ${savedFiles.length} file(s) saved to uploads folder.`
      );
    }
  }

  /**
   * Gửi tin nhắn thông thường sử dụng zaloApi đã có sẵn
   */
  async sendMessage(
    accountId: number,
    friendZaloId: string,
    message: string,
    type?: string,
    quote?: any
  ) {
    const instanceKey = this.findInstanceKeyByAccountId(accountId);
    if (!instanceKey) {
      throw new Error(`No active Zalo instance found for account ${accountId}`);
    }

    const instance = this.zaloInstances.get(instanceKey);
    if (!instance || !instance.api) {
      throw new Error(`Zalo API not available for account ${accountId}`);
    }

    try {
      const messageData: any = { msg: message };

      if (quote) {
        messageData.quote = quote;
      }

      const result = await instance.api.sendMessage(
        messageData,
        friendZaloId,
        ThreadType.User
      );

      return {
        success: true,
        result,
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  /**
   * Tìm instance key theo accountId
   */
  private findInstanceKeyByAccountId(accountId: number): string | null {
    for (const [key, instance] of this.zaloInstances) {
      if (instance.accountId === accountId) {
        return key;
      }
    }
    return null;
  }
}
