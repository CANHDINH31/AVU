import { useEffect, useCallback, useMemo, useRef } from "react";
import { useSocketContext } from "@/lib/contexts/socket-context";
import { useChatContext } from "@/lib/contexts/chat-context";
import { getUser } from "@/lib/auth";

export function useSocket() {
  const socketContext = useSocketContext();
  const { selectedAccounts } = useChatContext();
  const user = getUser();

  // Use ref to track previous selected accounts to avoid infinite loops
  const prevSelectedAccountsRef = useRef<string[]>([]);

  // Destructure only the methods we need to avoid dependency issues
  const {
    connectAccount,
    disconnectAccount,
    isAccountConnected,
    connectedAccounts,
    getAccountStatus,
    sendMessage,
    onAccountStatusChange,
    onNewMessage,
    onNewReaction,
    onNewUndo,
    onNewFriendEvent,
    removeEventListener,
    totalConnections,
    disconnectAll,
    getAllAccountStatuses,
  } = socketContext;

  // Memoize selected accounts as numbers to avoid recalculation
  const selectedAccountIds = useMemo(
    () => selectedAccounts.map((id) => parseInt(id)),
    [selectedAccounts]
  );

  // Auto-connect/disconnect when selected accounts change
  useEffect(() => {
    const prevSelected = prevSelectedAccountsRef.current;
    const currentSelected = selectedAccounts;

    // Only run if selected accounts actually changed
    if (JSON.stringify(prevSelected) !== JSON.stringify(currentSelected)) {
      // Connect new accounts
      if (user?.id) {
        selectedAccountIds.forEach((accountId) => {
          if (!isAccountConnected(accountId)) {
            connectAccount(accountId, user.id);
          }
        });
      }

      // Disconnect accounts that are no longer selected
      connectedAccounts.forEach((accountId) => {
        if (!selectedAccountIds.includes(accountId)) {
          disconnectAccount(accountId);
        }
      });

      // Update ref
      prevSelectedAccountsRef.current = currentSelected;
    }
  }, [
    selectedAccountIds,
    connectedAccounts,
    connectAccount,
    disconnectAccount,
    isAccountConnected,
    user?.id,
  ]);

  // Helper function to connect multiple accounts
  const connectAccounts = useCallback(
    (accountIds: number[]) => {
      if (!user?.id) {
        console.error("No user ID available");
        return;
      }
      accountIds.forEach((accountId) => {
        if (!isAccountConnected(accountId)) {
          connectAccount(accountId, user.id);
        }
      });
    },
    [connectAccount, isAccountConnected, user?.id]
  );

  // Helper function to disconnect multiple accounts
  const disconnectAccounts = useCallback(
    (accountIds: number[]) => {
      accountIds.forEach((accountId) => {
        if (isAccountConnected(accountId)) {
          disconnectAccount(accountId);
        }
      });
    },
    [disconnectAccount, isAccountConnected]
  );

  // Helper function to get status of multiple accounts
  const getAccountsStatus = useCallback(
    (accountIds: number[]) => {
      const statuses: Record<number, string> = {};
      accountIds.forEach((accountId) => {
        statuses[accountId] = getAccountStatus(accountId) || "disconnected";
      });
      return statuses;
    },
    [getAccountStatus]
  );

  return {
    // Core socket methods
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

    // Connection info
    totalConnections,
    connectedAccounts,

    // Helper methods
    connectAccounts,
    disconnectAccounts,
    getAccountsStatus,

    // Selected accounts as numbers
    selectedAccounts: selectedAccountIds,
  };
}
