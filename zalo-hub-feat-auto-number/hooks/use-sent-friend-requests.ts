import { useQuery } from "@tanstack/react-query";
import { sentFriendRequestApi } from "@/lib/api/sent-friend-request";
import { SentFriendRequestsListResponse } from "@/lib/types/api";

export const useSentFriendRequestsByAccountIds = (
  accountIds: string[],
  search?: string
) => {
  return useQuery<SentFriendRequestsListResponse>({
    queryKey: ["sent-friend-requests", accountIds, search],
    queryFn: () => sentFriendRequestApi.findByAccountIds(accountIds, search),
    enabled: accountIds.length > 0,
  });
};

export const useSentFriendRequestsByAccounts = (
  accountIds: string[],
  search?: string
) => {
  const { data, isLoading, error, refetch } = useSentFriendRequestsByAccountIds(
    accountIds,
    search
  );

  return {
    sentFriendRequests: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};
