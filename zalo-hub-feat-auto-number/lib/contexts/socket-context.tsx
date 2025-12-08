"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import io from "socket.io-client";
import { useToast } from "@/hooks/use-toast";

// Types
interface MessageData {
  accountId: number;
  userId: string;
  type: string;
  msgId: string;
  threadId: string;
  isSelf: boolean;
  content: string;
  idTo: string;
  uidFrom: string;
  timestamp: string;
}

interface ReactionData {
  messageId: number;
  conversationId: number;
  msgId: string;
  gMsgID: string;
  cMsgID: string;
  threadId: string;
  rType: number;
  rIcon: string;
  msgSender: string;
  dName: string;
  isSelf: boolean;
  action: "add" | "remove";
  timestamp: Date;
}

interface UndoData {
  conversationId: number;
}

interface AccountStatus {
  accountId: number;
  userId: string;
  status: "connected" | "disconnected" | "error" | "connecting";
  reason?: string;
  error?: string;
  timestamp: string;
}

interface SocketConnection {
  accountId: number;
  userId: string;
  socket: any; // Using any to avoid Socket type issues
  status: AccountStatus["status"];
  lastActivity: Date;
}

interface SocketContextType {
  // Connection management
  connectAccount: (accountId: number, userId: string) => Promise<void>;
  disconnectAccount: (accountId: number) => void;
  disconnectAll: () => void;

  // Status
  getAccountStatus: (accountId: number) => AccountStatus["status"] | null;
  getAllAccountStatuses: () => Record<number, AccountStatus["status"]>;
  isAccountConnected: (accountId: number) => boolean;

  // Message handling
  sendMessage: (accountId: number, message: any) => void;

  // Event listeners
  onAccountStatusChange: (
    accountId: number,
    callback: (status: AccountStatus) => void
  ) => void;
  onNewMessage: (
    accountId: number,
    callback: (message: MessageData) => void
  ) => void;
  onNewReaction: (
    accountId: number,
    conversationId: (reaction: ReactionData) => void
  ) => void;
  onNewUndo: (
    accountId: number,
    callback: (conversationId: number) => void
  ) => void;
  onNewFriendEvent: (
    accountId: number,
    callback: (status: { isFr: number; conversationId: number }) => void
  ) => void;
  removeEventListener: (
    accountId: number,
    event: string,
    callback: Function
  ) => void;

  // Connection info
  totalConnections: number;
  connectedAccounts: number[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Map<number, SocketConnection>>(
    new Map()
  );
  const eventListenersRef = useRef(new Map());
  const { toast } = useToast();
  const socketUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001/chat";

  // Use ref to store current connections state
  const connectionsRef = useRef<Map<number, SocketConnection>>(new Map());

  // Update ref whenever connections state changes
  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  // Helper function to get event key
  const getEventKey = (accountId: number, event: string) =>
    `${accountId}:${event}`;

  // Connect to a specific account
  const connectAccount = useCallback(
    async (accountId: number, userId: string) => {
      try {
        // Check if already connected using ref
        const currentConnections = connectionsRef.current;
        if (currentConnections.has(accountId)) {
          const connection = currentConnections.get(accountId)!;
          if (connection.status === "connected") {
            console.log(`[SOCKET] Account ${accountId} already connected`);
            return;
          }
        }

        // Update status to connecting
        setConnections((prevConnections) => {
          const newConnections = new Map(prevConnections);
          if (newConnections.has(accountId)) {
            const conn = newConnections.get(accountId)!;
            newConnections.set(accountId, { ...conn, status: "connecting" });
          }
          return newConnections;
        });

        // Create new socket connection
        const socket = io(socketUrl, {
          auth: {
            accountIds: [accountId],
            userId: userId,
          },
          timeout: 10000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Set up socket event listeners
        socket.on("connect", () => {
          setConnections((prev) => {
            const newConnections = new Map(prev);
            newConnections.set(accountId, {
              accountId,
              userId,
              socket,
              status: "connected",
              lastActivity: new Date(),
            });
            return newConnections;
          });

          toast({
            title: `Tài khoản ${accountId} đã kết nối`,
            description: "Kết nối socket thành công",
            variant: "default",
          });
        });

        socket.on("disconnect", (reason: string) => {
          console.log(`[SOCKET] Account ${accountId} disconnected:`, reason);

          setConnections((prev) => {
            const newConnections = new Map(prev);
            if (newConnections.has(accountId)) {
              const conn = newConnections.get(accountId)!;
              newConnections.set(accountId, {
                ...conn,
                status: "disconnected",
              });
            }
            return newConnections;
          });

          toast({
            title: `Tài khoản ${accountId} đã ngắt kết nối`,
            description: reason || "Kết nối bị mất",
            variant: "destructive",
          });
        });

        socket.on("error", (error: Error) => {
          console.error(`[SOCKET] Account ${accountId} error:`, error);

          setConnections((prev) => {
            const newConnections = new Map(prev);
            if (newConnections.has(accountId)) {
              const conn = newConnections.get(accountId)!;
              newConnections.set(accountId, { ...conn, status: "error" });
            }
            return newConnections;
          });

          toast({
            title: `Lỗi tài khoản ${accountId}`,
            description: error.message || "Có lỗi xảy ra",
            variant: "destructive",
          });
        });

        // Handle account-specific events
        socket.on("account_connected", (data: AccountStatus) => {
          // Use setTimeout to avoid calling triggerEvent before it's defined
          setTimeout(
            () => triggerEvent(accountId, "account_status_change", data),
            0
          );
        });

        socket.on("account_disconnected", (data: AccountStatus) => {
          console.log(`[SOCKET] Account ${accountId} status: disconnected`);
          setTimeout(
            () => triggerEvent(accountId, "account_status_change", data),
            0
          );
        });

        socket.on("account_error", (data: AccountStatus) => {
          console.log(`[SOCKET] Account ${accountId} status: error`);
          setTimeout(
            () => triggerEvent(accountId, "account_status_change", data),
            0
          );
        });

        socket.on("new_message", (data: MessageData) => {
          setTimeout(() => triggerEvent(accountId, "new_message", data), 0);
        });

        socket.on("new_reaction", (data: ReactionData) => {
          setTimeout(() => triggerEvent(accountId, "new_reaction", data), 0);
        });

        socket.on("new_undo", (data: UndoData) => {
          setTimeout(() => triggerEvent(accountId, "new_undo", data), 0);
        });

        socket.on("new_friend_event", (data: { isFr: number }) => {
          setTimeout(
            () => triggerEvent(accountId, "new_friend_event", data),
            0
          );
        });

        // Store initial connection
        setConnections((prev) => {
          const newConnections = new Map(prev);
          newConnections.set(accountId, {
            accountId,
            userId,
            socket,
            status: "connecting",
            lastActivity: new Date(),
          });
          return newConnections;
        });
      } catch (error) {
        console.error(
          `[SOCKET] Failed to connect account ${accountId}:`,
          error
        );

        setConnections((prev) => {
          const newConnections = new Map(prev);
          if (newConnections.has(accountId)) {
            const conn = newConnections.get(accountId)!;
            newConnections.set(accountId, { ...conn, status: "error" });
          }
          return newConnections;
        });

        toast({
          title: `Lỗi kết nối tài khoản ${accountId}`,
          description: "Không thể kết nối với server",
          variant: "destructive",
        });
      }
    },
    [socketUrl, toast] // Removed triggerEvent from dependencies
  );

  // Disconnect a specific account
  const disconnectAccount = useCallback(
    (accountId: number) => {
      const currentConnections = connectionsRef.current;
      const connection = currentConnections.get(accountId);
      if (connection) {
        console.log(`[SOCKET] Disconnecting account ${accountId}...`);
        connection.socket.disconnect();

        setConnections((prev) => {
          const newConnections = new Map(prev);
          newConnections.delete(accountId);
          return newConnections;
        });

        // Remove event listeners for this account
        eventListenersRef.current.delete(
          getEventKey(accountId, "account_status_change")
        );
        eventListenersRef.current.delete(getEventKey(accountId, "new_message"));
        eventListenersRef.current.delete(
          getEventKey(accountId, "new_reaction")
        );

        toast({
          title: `Đã ngắt kết nối tài khoản ${accountId}`,
          description: "Kết nối socket đã được đóng",
          variant: "default",
        });
      }
    },
    [toast]
  );

  // Disconnect all accounts
  const disconnectAll = useCallback(() => {
    console.log("[SOCKET] Disconnecting all accounts...");

    const currentConnections = connectionsRef.current;
    currentConnections.forEach((connection, accountId) => {
      connection.socket.disconnect();
    });

    setConnections(new Map());
    eventListenersRef.current.clear();

    toast({
      title: "Đã ngắt tất cả kết nối",
      description: "Tất cả kết nối socket đã được đóng",
      variant: "default",
    });
  }, [toast]);

  // Get account status
  const getAccountStatus = useCallback((accountId: number) => {
    const currentConnections = connectionsRef.current;
    const connection = currentConnections.get(accountId);
    return connection?.status || null;
  }, []);

  // Get all account statuses
  const getAllAccountStatuses = useCallback(() => {
    const statuses: Record<number, AccountStatus["status"]> = {};
    const currentConnections = connectionsRef.current;
    currentConnections.forEach((connection, accountId) => {
      statuses[accountId] = connection.status;
    });
    return statuses;
  }, []);

  // Check if account is connected
  const isAccountConnected = useCallback((accountId: number) => {
    const currentConnections = connectionsRef.current;
    const connection = currentConnections.get(accountId);
    return connection?.status === "connected";
  }, []);

  // Send message through specific account
  const sendMessage = useCallback(
    (accountId: number, message: any) => {
      const currentConnections = connectionsRef.current;
      const connection = currentConnections.get(accountId);
      if (connection && connection.status === "connected") {
        connection.socket.emit("send_message", message);
        console.log(
          `[SOCKET] Sent message through account ${accountId}:`,
          message
        );
      } else {
        console.warn(
          `[SOCKET] Cannot send message: account ${accountId} not connected`
        );
        toast({
          title: "Không thể gửi tin nhắn",
          description: `Tài khoản ${accountId} chưa kết nối`,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Add event listener
  const onAccountStatusChange = useCallback(
    (accountId: number, callback: (status: AccountStatus) => void) => {
      const eventKey = getEventKey(accountId, "account_status_change");
      if (!eventListenersRef.current.has(eventKey)) {
        eventListenersRef.current.set(eventKey, new Set<Function>());
      }
      (eventListenersRef.current.get(eventKey) as Set<Function>).add(callback);
    },
    []
  );

  // Add new message listener
  const onNewMessage = useCallback(
    (accountId: number, callback: (message: MessageData) => void) => {
      const eventKey = getEventKey(accountId, "new_message");
      if (!eventListenersRef.current.has(eventKey)) {
        eventListenersRef.current.set(eventKey, new Set<Function>());
      }
      (eventListenersRef.current.get(eventKey) as Set<Function>).add(callback);
    },
    []
  );

  // Add new reaction listener
  const onNewReaction = useCallback(
    (accountId: number, callback: (reaction: ReactionData) => void) => {
      const eventKey = getEventKey(accountId, "new_reaction");
      if (!eventListenersRef.current.has(eventKey)) {
        eventListenersRef.current.set(eventKey, new Set<Function>());
      }
      (eventListenersRef.current.get(eventKey) as Set<Function>).add(callback);
    },
    []
  );

  // Add new undo listener
  const onNewUndo = useCallback(
    (accountId: number, callback: (conversationId: number) => void) => {
      const eventKey = getEventKey(accountId, "new_undo");
      if (!eventListenersRef.current.has(eventKey)) {
        eventListenersRef.current.set(eventKey, new Set<Function>());
      }
      (eventListenersRef.current.get(eventKey) as Set<Function>).add(callback);
    },
    []
  );

  // Add new friend event listener
  const onNewFriendEvent = useCallback(
    (
      accountId: number,
      callback: (status: { isFr: number; conversationId: number }) => void
    ) => {
      const eventKey = getEventKey(accountId, "new_friend_event");
      if (!eventListenersRef.current.has(eventKey)) {
        eventListenersRef.current.set(eventKey, new Set<Function>());
      }
      (eventListenersRef.current.get(eventKey) as Set<Function>).add(callback);
    },
    []
  );

  // Remove event listener
  const removeEventListener = useCallback(
    (accountId: number, event: string, callback: Function) => {
      const eventKey = getEventKey(accountId, event);
      const listeners = eventListenersRef.current.get(eventKey) as
        | Set<Function>
        | undefined;
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          eventListenersRef.current.delete(eventKey);
        }
      }
    },
    []
  );

  // Trigger event for specific account
  const triggerEvent = useCallback(
    (accountId: number, event: string, data: any) => {
      const eventKey = getEventKey(accountId, event);
      const listeners = eventListenersRef.current.get(eventKey) as
        | Set<Function>
        | undefined;

      if (listeners) {
        listeners.forEach((callback) => {
          try {
            callback(data);
          } catch (error) {
            console.error(
              `[SOCKET] Error in event listener for ${eventKey}:`,
              error
            );
          }
        });
      } else {
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAll();
    };
  }, [disconnectAll]);

  // Memoize connection info to avoid unnecessary re-renders
  const connectionInfo = useMemo(() => {
    const currentConnections = connectionsRef.current;
    const connectedAccountIds = Array.from(currentConnections.keys()).filter(
      (id) => {
        const connection = currentConnections.get(id);
        return connection?.status === "connected";
      }
    );

    return {
      totalConnections: currentConnections.size,
      connectedAccounts: connectedAccountIds,
    };
  }, [connections]); // Only recalculate when connections state changes

  const contextValue: SocketContextType = {
    connectAccount,
    disconnectAccount,
    disconnectAll,
    getAccountStatus,
    getAllAccountStatuses,
    isAccountConnected,
    sendMessage,
    onAccountStatusChange,
    onNewMessage,
    onNewReaction,
    onNewUndo,
    onNewFriendEvent,
    removeEventListener,
    totalConnections: connectionInfo.totalConnections,
    connectedAccounts: connectionInfo.connectedAccounts,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
