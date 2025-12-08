import { Injectable, Logger } from "@nestjs/common";

interface AccountConnection {
  accountId: number;
  userId: string;
  socketId: string;
  connectedAt: Date;
}

interface AccountStatus {
  accountId: number;
  userId: string;
  status: "connected" | "disconnected" | "error";
  reason?: string;
  error?: string;
  timestamp: Date;
}

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);

  // Map accountId to connection info
  private accountConnections = new Map<number, AccountConnection>();

  // Map socketId to accountId for quick lookup
  private socketAccountMap = new Map<string, number>();

  // Map userId to accountIds (one user can have multiple accounts)
  private userAccountsMap = new Map<string, Set<number>>();

  // Store account status history
  private accountStatusHistory = new Map<number, AccountStatus[]>();

  /**
   * Add an account connection
   */
  addAccountConnection(
    accountId: number,
    userId: string,
    socketId: string
  ): void {
    const connection: AccountConnection = {
      accountId,
      userId,
      socketId,
      connectedAt: new Date(),
    };

    this.accountConnections.set(accountId, connection);
    this.socketAccountMap.set(socketId, accountId);

    // Update user-accounts mapping
    if (!this.userAccountsMap.has(userId)) {
      this.userAccountsMap.set(userId, new Set());
    }
    this.userAccountsMap.get(userId).add(accountId);

    // Add status to history
    this.addAccountStatus(accountId, userId, "connected");

    this.logger.log(
      `Account ${accountId} (User: ${userId}) connected with socket ${socketId}`
    );
    this.logActiveConnections();
  }

  /**
   * Remove an account connection
   */
  removeAccountConnection(
    accountId: number,
    socketId: string,
    reason?: string
  ): void {
    const connection = this.accountConnections.get(accountId);
    if (connection) {
      const userId = connection.userId;

      this.accountConnections.delete(accountId);
      this.socketAccountMap.delete(socketId);

      // Update user-accounts mapping
      const userAccounts = this.userAccountsMap.get(userId);
      if (userAccounts) {
        userAccounts.delete(accountId);
        if (userAccounts.size === 0) {
          this.userAccountsMap.delete(userId);
        }
      }

      // Add status to history
      this.addAccountStatus(accountId, userId, "disconnected", reason);

      this.logger.log(
        `Account ${accountId} (User: ${userId}) disconnected: ${reason || "No reason provided"}`
      );
    }

    this.logActiveConnections();
  }

  /**
   * Add account error status
   */
  addAccountError(accountId: number, userId: string, error: string): void {
    this.addAccountStatus(accountId, userId, "error", undefined, error);
    this.logger.error(`Account ${accountId} (User: ${userId}) error: ${error}`);
  }

  /**
   * Add account status to history
   */
  private addAccountStatus(
    accountId: number,
    userId: string,
    status: "connected" | "disconnected" | "error",
    reason?: string,
    error?: string
  ): void {
    const accountStatus: AccountStatus = {
      accountId,
      userId,
      status,
      reason,
      error,
      timestamp: new Date(),
    };

    if (!this.accountStatusHistory.has(accountId)) {
      this.accountStatusHistory.set(accountId, []);
    }

    const history = this.accountStatusHistory.get(accountId);
    history.push(accountStatus);

    // Keep only last 50 status entries
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * Get account connection info
   */
  getAccountConnection(accountId: number): AccountConnection | undefined {
    return this.accountConnections.get(accountId);
  }

  /**
   * Get account ID for a socket
   */
  getSocketAccount(socketId: string): number | undefined {
    return this.socketAccountMap.get(socketId);
  }

  /**
   * Check if account is connected
   */
  isAccountConnected(accountId: number): boolean {
    return this.accountConnections.has(accountId);
  }

  /**
   * Get all connected accounts
   */
  getConnectedAccounts(): number[] {
    return Array.from(this.accountConnections.keys());
  }

  /**
   * Get all accounts for a user
   */
  getUserAccounts(userId: string): number[] {
    const accounts = this.userAccountsMap.get(userId);
    return accounts ? Array.from(accounts) : [];
  }

  /**
   * Get user ID for an account
   */
  getAccountUser(accountId: number): string | undefined {
    const connection = this.accountConnections.get(accountId);
    return connection?.userId;
  }

  /**
   * Get total number of connected accounts
   */
  getConnectedAccountsCount(): number {
    return this.accountConnections.size;
  }

  /**
   * Get total number of socket connections
   */
  getTotalConnectionsCount(): number {
    return this.socketAccountMap.size;
  }

  /**
   * Get total number of unique users
   */
  getUniqueUsersCount(): number {
    return this.userAccountsMap.size;
  }

  /**
   * Disconnect all accounts for a user
   */
  disconnectUser(userId: string): number[] {
    const accountIds = this.getUserAccounts(userId);
    accountIds.forEach((accountId) => {
      const connection = this.accountConnections.get(accountId);
      if (connection) {
        this.removeAccountConnection(
          accountId,
          connection.socketId,
          "User disconnected"
        );
      }
    });

    this.logger.log(`Disconnected all accounts for user ${userId}`);
    return accountIds;
  }

  /**
   * Get account status history
   */
  getAccountStatusHistory(accountId: number): AccountStatus[] {
    return this.accountStatusHistory.get(accountId) || [];
  }

  /**
   * Get latest account status
   */
  getLatestAccountStatus(accountId: number): AccountStatus | undefined {
    const history = this.getAccountStatusHistory(accountId);
    return history.length > 0 ? history[history.length - 1] : undefined;
  }

  /**
   * Log active connections for debugging
   */
  private logActiveConnections(): void {
    this.logger.debug(`Active connections: ${this.getTotalConnectionsCount()}`);
    this.logger.debug(
      `Connected accounts: ${this.getConnectedAccountsCount()}`
    );
    this.logger.debug(`Unique users: ${this.getUniqueUsersCount()}`);
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      totalConnections: this.getTotalConnectionsCount(),
      connectedAccounts: this.getConnectedAccountsCount(),
      uniqueUsers: this.getUniqueUsersCount(),
      connectedAccountsList: this.getConnectedAccounts(),
    };
  }

  /**
   * Get all account connections with details
   */
  getAllAccountConnections(): AccountConnection[] {
    return Array.from(this.accountConnections.values());
  }
}
