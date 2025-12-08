import { useQuery } from "@tanstack/react-query";
import { friendRequestApi } from "@/lib/api";
import { FriendRequestsListResponse } from "@/lib/types/api";
import { useSocket } from "./use-socket";
import { useCallback, useEffect } from "react";

export const useFriendRequestsByAccountIds = (
  accountIds: string[],
  search?: string
) => {
  return useQuery<FriendRequestsListResponse>({
    queryKey: ["friend-requests", accountIds, search],
    queryFn: () => friendRequestApi.findByAccountIds(accountIds, search),
    enabled: accountIds.length > 0,
  });
};

export const useFriendRequestsByAccounts = (
  accountIds: string[],
  search?: string
) => {
  const { data, isLoading, error, refetch } = useFriendRequestsByAccountIds(
    accountIds,
    search
  );

  return {
    friendRequests: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};

export function useFriendRequests(
  accountId: number,
  conversationId: number,
  refetch: any
) {
  const { onNewFriendEvent, removeEventListener } = useSocket();

  const handleNewFriendRequest = useCallback(
    async (data: { isFr: number; conversationId: number }) => {
      if (refetch && data.conversationId === conversationId) {
        refetch();
      }
    },
    [refetch]
  );

  useEffect(() => {
    if (accountId === -1 || accountId === undefined || accountId === null)
      return;
    onNewFriendEvent(accountId, handleNewFriendRequest);

    return () => {
      removeEventListener(
        accountId,
        "new_friend_event",
        handleNewFriendRequest
      );
    };
  }, [
    accountId,
    onNewFriendEvent,
    removeEventListener,
    handleNewFriendRequest,
  ]);
}
