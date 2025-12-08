import { useQuery } from "@tanstack/react-query";
import { friendApi } from "@/lib/api/friend";
import { FriendsListResponse } from "@/lib/types/api";
import { Friend } from "../lib/types/friend";

export const useFriendsByAccountIds = (
  accountIds: string[],
  search?: string
) => {
  return useQuery<FriendsListResponse>({
    queryKey: ["friends", accountIds, search],
    queryFn: () => friendApi.findByAccountIds(accountIds, search),
    enabled: accountIds.length > 0,
  });
};

export const useFriendsByAccounts = (accountIds: string[], search?: string) => {
  const { data, isLoading, error, refetch } = useFriendsByAccountIds(
    accountIds,
    search
  );

  return {
    friends: data?.data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useFriendsByAccountId = (accountId: number, search?: string) => {
  return useQuery<FriendsListResponse>({
    queryKey: ["friends", accountId, search],
    queryFn: () => friendApi.findByAccountId(accountId),
    enabled: !!accountId,
  });
};

export const useFriendByUidFrom = (uidFrom: string) => {
  return useQuery<Friend[]>({
    queryKey: ["friend", uidFrom],
    queryFn: () => friendApi.findByUidFrom(uidFrom),
    enabled: !!uidFrom,
  });
};
