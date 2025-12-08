import { Controller, Get, Post, Param, Logger } from "@nestjs/common";
import { SocketService } from "./socket.service";

@Controller("socket")
export class SocketController {
  private readonly logger = new Logger(SocketController.name);

  constructor(private readonly socketService: SocketService) {}

  @Get("stats")
  getConnectionStats() {
    return this.socketService.getConnectionStats();
  }

  @Get("connected-accounts")
  getConnectedAccounts() {
    return {
      accounts: this.socketService.getConnectedAccounts(),
      count: this.socketService.getConnectedAccountsCount(),
    };
  }

  @Get("account/:accountId/status")
  getAccountStatus(@Param("accountId") accountId: string) {
    const accountIdNum = parseInt(accountId, 10);
    const isConnected = this.socketService.isAccountConnected(accountIdNum);
    const connection = this.socketService.getAccountConnection(accountIdNum);
    const latestStatus =
      this.socketService.getLatestAccountStatus(accountIdNum);

    return {
      accountId: accountIdNum,
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
    };
  }

  @Get("account/:accountId/history")
  getAccountStatusHistory(@Param("accountId") accountId: string) {
    const accountIdNum = parseInt(accountId, 10);
    const history = this.socketService.getAccountStatusHistory(accountIdNum);

    return {
      accountId: accountIdNum,
      history: history.map((status) => ({
        accountId: status.accountId,
        userId: status.userId,
        status: status.status,
        reason: status.reason,
        error: status.error,
        timestamp: status.timestamp,
      })),
    };
  }

  @Post("accounts/:accountId/disconnect")
  disconnectAccount(@Param("accountId") accountId: string) {
    const accountIdNum = parseInt(accountId, 10);
    const connection = this.socketService.getAccountConnection(accountIdNum);

    if (connection) {
      this.socketService.removeAccountConnection(
        accountIdNum,
        connection.socketId,
        "Admin disconnect"
      );
      this.logger.log(`Admin disconnected account ${accountIdNum}`);

      return {
        accountId: accountIdNum,
        message: `Account ${accountIdNum} disconnected successfully`,
      };
    } else {
      return {
        accountId: accountIdNum,
        message: `Account ${accountIdNum} was not connected`,
      };
    }
  }

  @Get("user/:userId/accounts")
  getUserAccounts(@Param("userId") userId: string) {
    const accountIds = this.socketService.getUserAccounts(userId);

    return {
      userId,
      accountIds,
      count: accountIds.length,
    };
  }

  @Post("users/:userId/disconnect")
  disconnectUser(@Param("userId") userId: string) {
    const disconnectedAccounts = this.socketService.disconnectUser(userId);
    this.logger.log(`Admin disconnected all accounts for user ${userId}`);

    return {
      userId,
      disconnectedAccounts,
      message: `Disconnected ${disconnectedAccounts.length} account(s) for user ${userId}`,
    };
  }

  @Get("connections/count")
  getConnectionsCount() {
    return {
      totalConnections: this.socketService.getTotalConnectionsCount(),
      connectedAccounts: this.socketService.getConnectedAccountsCount(),
      uniqueUsers: this.socketService.getUniqueUsersCount(),
    };
  }

  @Get("all-connections")
  getAllConnections() {
    const connections = this.socketService.getAllAccountConnections();

    return {
      connections: connections.map((conn) => ({
        accountId: conn.accountId,
        userId: conn.userId,
        socketId: conn.socketId,
        connectedAt: conn.connectedAt,
      })),
      count: connections.length,
    };
  }
}
