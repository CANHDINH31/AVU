import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { SocketService } from "./socket.service";
import {
  MessageDataDto,
  AccountStatusDto,
  SendMessageDto,
  JoinRoomDto,
  LeaveRoomDto,
  TypingDto,
  ReadMessagesDto,
  ReactionDataDto,
} from "./dto/socket.dto";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  namespace: "/chat",
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(private readonly socketService: SocketService) {}

  afterInit(server: Server) {
    this.logger.log("WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    try {
      const accountIds = client.handshake.auth.accountIds || [];
      const userId = client.handshake.auth.userId || `user_${Date.now()}`;

      this.logger.log(
        `Client ${client.id} connecting with accounts: ${accountIds.join(", ")}`
      );

      if (!accountIds || accountIds.length === 0) {
        this.logger.warn(`Client ${client.id} connected without account IDs`);
        client.emit("error", {
          message: "No account IDs provided",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Store account IDs in client data for later use
      client.data.accountIds = accountIds;
      client.data.userId = userId;
      client.data.socketId = client.id;

      // Register each account connection
      accountIds.forEach((accountId: number) => {
        try {
          this.socketService.addAccountConnection(accountId, userId, client.id);

          // Emit account connected event
          const accountStatus: AccountStatusDto = {
            accountId,
            userId,
            status: "connected",
            timestamp: new Date().toISOString(),
          };

          // Emit to the specific client
          client.emit("account_connected", accountStatus);

          // Broadcast to all clients for real-time updates
          this.server.emit("account_status_update", accountStatus);

          this.logger.log(`Account ${accountId} connected successfully`);
        } catch (error) {
          this.logger.error(`Failed to connect account ${accountId}:`, error);

          const accountStatus: AccountStatusDto = {
            accountId,
            userId,
            status: "error",
            error: error.message,
            timestamp: new Date().toISOString(),
          };

          client.emit("account_error", accountStatus);
        }
      });

      // Send connection stats to the client
      const stats = this.socketService.getConnectionStats();
      client.emit("connection_stats", {
        stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error in handleConnection:`, error);
      client.emit("error", {
        message: "Connection failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const accountIds = client.data.accountIds || [];
      const userId = client.data.userId;
      const socketId = client.data.socketId;

      this.logger.log(
        `Client ${socketId} disconnected with accounts: ${accountIds.join(", ")}`
      );

      // Handle each account disconnection
      accountIds.forEach((accountId: number) => {
        try {
          const connection = this.socketService.getAccountConnection(accountId);
          if (connection) {
            this.socketService.removeAccountConnection(
              accountId,
              socketId,
              "Client disconnected"
            );

            // Emit account disconnected event
            const accountStatus: AccountStatusDto = {
              accountId,
              userId: connection.userId,
              status: "disconnected",
              reason: "Client disconnected",
              timestamp: new Date().toISOString(),
            };

            // Broadcast to all clients
            this.server.emit("account_disconnected", accountStatus);
            this.server.emit("account_status_update", accountStatus);

            this.logger.log(`Account ${accountId} disconnected successfully`);
          }
        } catch (error) {
          this.logger.error(
            `Failed to disconnect account ${accountId}:`,
            error
          );
        }
      });
    } catch (error) {
      this.logger.error(`Error in handleDisconnect:`, error);
    }
  }

  @SubscribeMessage("join_room")
  handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId } = data;
      const accountIds = client.data.accountIds || [];

      if (!roomId) {
        return { event: "error", message: "Room ID is required" };
      }

      client.join(roomId);
      this.logger.log(
        `Client ${client.id} joined room: ${roomId} with accounts: ${accountIds.join(", ")}`
      );

      return { event: "joined_room", roomId };
    } catch (error) {
      this.logger.error(`Error in handleJoinRoom:`, error);
      return { event: "error", message: "Failed to join room" };
    }
  }

  @SubscribeMessage("leave_room")
  handleLeaveRoom(
    @MessageBody() data: LeaveRoomDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId } = data;
      const accountIds = client.data.accountIds || [];

      if (!roomId) {
        return { event: "error", message: "Room ID is required" };
      }

      client.leave(roomId);
      this.logger.log(
        `Client ${client.id} left room: ${roomId} with accounts: ${accountIds.join(", ")}`
      );

      return { event: "left_room", roomId };
    } catch (error) {
      this.logger.error(`Error in handleLeaveRoom:`, error);
      return { event: "error", message: "Failed to leave room" };
    }
  }

  @SubscribeMessage("send_message")
  handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId, message } = data;
      const accountIds = client.data.accountIds || [];

      if (!roomId || !message) {
        return {
          event: "error",
          message: "Room ID and message are required",
        };
      }

      if (accountIds.length === 0) {
        return {
          event: "error",
          message: "No accounts associated with this connection",
        };
      }

      // For now, use the first account - in a real app, you'd specify which account
      const accountId = accountIds[0];
      const connection = this.socketService.getAccountConnection(accountId);

      if (!connection) {
        return { event: "error", message: "Account not connected" };
      }

      // const messageData: MessageDataDto = {
      //   accountId,
      //   userId: connection.userId,
      //   type: message.type || "text",
      //   msgId: message.id || `msg_${Date.now()}`,
      //   threadId: roomId,
      //   isSelf: true,
      //   content: message.content,
      //   idTo: roomId,
      //   uidFrom: connection.userId,
      //   timestamp: new Date().toISOString(),
      // };

      // Broadcast to room
      // this.server.to(roomId).emit("new_message", messageData);

      this.logger.log(`Message sent to room ${roomId} by account ${accountId}`);
      // return { event: "message_sent", messageId: messageData.msgId };
    } catch (error) {
      this.logger.error(`Error in handleSendMessage:`, error);
      return { event: "error", message: "Failed to send message" };
    }
  }

  @SubscribeMessage("typing")
  handleTyping(
    @MessageBody() data: TypingDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId, isTyping } = data;
      const accountIds = client.data.accountIds || [];

      if (!roomId) {
        return { event: "error", message: "Room ID is required" };
      }

      if (accountIds.length > 0) {
        const accountId = accountIds[0];
        const connection = this.socketService.getAccountConnection(accountId);

        if (connection) {
          client.to(roomId).emit("user_typing", {
            accountId,
            userId: connection.userId,
            isTyping,
            roomId,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error in handleTyping:`, error);
    }
  }

  @SubscribeMessage("read_messages")
  handleReadMessages(
    @MessageBody() data: ReadMessagesDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { roomId, messageIds } = data;
      const accountIds = client.data.accountIds || [];

      if (!roomId || !messageIds) {
        return {
          event: "error",
          message: "Room ID and message IDs are required",
        };
      }

      if (accountIds.length > 0) {
        const accountId = accountIds[0];
        const connection = this.socketService.getAccountConnection(accountId);

        if (connection) {
          client.to(roomId).emit("messages_read", {
            accountId,
            userId: connection.userId,
            messageIds,
            roomId,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error in handleReadMessages:`, error);
    }
  }

  @SubscribeMessage("get_connection_stats")
  handleGetConnectionStats(@ConnectedSocket() client: Socket) {
    try {
      const stats = this.socketService.getConnectionStats();
      client.emit("connection_stats", {
        stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error in handleGetConnectionStats:`, error);
      client.emit("error", {
        message: "Failed to get connection stats",
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage("check_account_status")
  handleCheckAccountStatus(
    @MessageBody() data: { accountId: number },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { accountId } = data;

      if (!accountId) {
        return { event: "error", message: "Account ID is required" };
      }

      const isConnected = this.socketService.isAccountConnected(accountId);
      const connection = this.socketService.getAccountConnection(accountId);
      const latestStatus = this.socketService.getLatestAccountStatus(accountId);

      client.emit("account_status_result", {
        accountId,
        isConnected,
        connection: connection
          ? {
              accountId: connection.accountId,
              userId: connection.userId,
              socketId: connection.socketId,
              connectedAt: connection.connectedAt,
            }
          : null,
        latestStatus: latestStatus
          ? {
              accountId: latestStatus.accountId,
              userId: latestStatus.userId,
              status: latestStatus.status,
              reason: latestStatus.reason,
              error: latestStatus.error,
              timestamp: latestStatus.timestamp,
            }
          : null,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error in handleCheckAccountStatus:`, error);
      client.emit("error", {
        message: "Failed to check account status",
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Method to send new message to specific account
  sendNewMessageToAccount(accountId: number, message: MessageDataDto) {
    try {
      const connection = this.socketService.getAccountConnection(accountId);

      if (connection) {
        this.server.to(connection.socketId).emit("new_message", message);
        this.logger.log(`New message sent to account ${accountId}`);
      } else {
        this.logger.warn(
          `Account ${accountId} not connected, cannot send message`
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending message to account ${accountId}:`,
        error
      );
    }
  }

  // Method to send reaction to specific account
  sendReactionToAccount(accountId: number, reaction: ReactionDataDto) {
    try {
      const connection = this.socketService.getAccountConnection(accountId);

      if (connection) {
        this.server.to(connection.socketId).emit("new_reaction", reaction);
        this.logger.log(`New reaction sent to account ${accountId}`);
      } else {
        this.logger.warn(
          `Account ${accountId} not connected, cannot send reaction`
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending reaction to account ${accountId}:`,
        error
      );
    }
  }

  sendStatusFriendEventToAccount(
    accountId: number,
    status: { isFr: number; conversationId: number }
  ) {
    try {
      const connection = this.socketService.getAccountConnection(accountId);

      if (connection) {
        this.server.to(connection.socketId).emit("new_friend_event", status);
        this.logger.log(`New status sent to account ${accountId}`);
      } else {
        this.logger.warn(
          `Account ${accountId} not connected, cannot send status`
        );
      }
    } catch (error) {
      this.logger.error(
        `Error sending reaction to account ${accountId}:`,
        error
      );
    }
  }

  // Method to send undo to specific account
  async sendUndoToAccount(accountId: number, conversationId: number) {
    try {
      const connection =
        await this.socketService.getAccountConnection(accountId);
      if (connection) {
        this.server.to(connection.socketId).emit("new_undo", {
          conversationId,
        });
      }
    } catch (error) {}
  }

  // Method to send account status update
  sendAccountStatusUpdate(accountId: number, status: AccountStatusDto) {
    try {
      const connection = this.socketService.getAccountConnection(accountId);
      if (connection) {
        this.server
          .to(connection.socketId)
          .emit("account_status_update", status);
      }
      // Also broadcast to all clients for real-time updates
      this.server.emit("account_status_update", status);
    } catch (error) {
      this.logger.error(
        `Error sending status update for account ${accountId}:`,
        error
      );
    }
  }

  // Method to send error to specific account
  sendErrorToAccount(accountId: number, error: string) {
    try {
      const connection = this.socketService.getAccountConnection(accountId);
      if (connection) {
        this.server.to(connection.socketId).emit("error", {
          message: error,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.logger.error(`Error sending error to account ${accountId}:`, error);
    }
  }

  // Method to broadcast to all connected clients
  broadcastToAll(event: string, data: any) {
    try {
      this.server.emit(event, data);
    } catch (error) {
      this.logger.error(`Error broadcasting to all clients:`, error);
    }
  }

  // Method to send to specific room
  sendToRoom(roomId: string, event: string, data: any) {
    try {
      this.server.to(roomId).emit(event, data);
    } catch (error) {
      this.logger.error(`Error sending to room ${roomId}:`, error);
    }
  }

  // Method to get all connected accounts
  getConnectedAccounts(): number[] {
    return this.socketService.getConnectedAccounts();
  }

  // Method to check if account is connected
  isAccountConnected(accountId: number): boolean {
    return this.socketService.isAccountConnected(accountId);
  }

  @SubscribeMessage("subscribe_conversation")
  handleSubscribeConversation(
    @MessageBody() data: { conversationId: number; threadId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { conversationId, threadId } = data;
      const accountIds = client.data.accountIds || [];

      if (!conversationId || !threadId) {
        return {
          event: "error",
          message: "Conversation ID and Thread ID are required",
        };
      }

      // Join the conversation room
      const roomName = `conversation_${threadId}`;
      client.join(roomName);

      this.logger.log(
        `Client ${client.id} subscribed to conversation ${conversationId} (threadId: ${threadId}) with accounts: ${accountIds.join(", ")}`
      );

      return {
        event: "subscribed_conversation",
        conversationId,
        threadId,
        roomName,
      };
    } catch (error) {
      this.logger.error(`Error in handleSubscribeConversation:`, error);
      return { event: "error", message: "Failed to subscribe to conversation" };
    }
  }

  @SubscribeMessage("unsubscribe_conversation")
  handleUnsubscribeConversation(
    @MessageBody() data: { threadId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const { threadId } = data;
      const accountIds = client.data.accountIds || [];

      if (!threadId) {
        return { event: "error", message: "Thread ID is required" };
      }

      // Leave the conversation room
      const roomName = `conversation_${threadId}`;
      client.leave(roomName);

      this.logger.log(
        `Client ${client.id} unsubscribed from conversation (threadId: ${threadId}) with accounts: ${accountIds.join(", ")}`
      );

      return {
        event: "unsubscribed_conversation",
        threadId,
        roomName,
      };
    } catch (error) {
      this.logger.error(`Error in handleUnsubscribeConversation:`, error);
      return {
        event: "error",
        message: "Failed to unsubscribe from conversation",
      };
    }
  }
}
