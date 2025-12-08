import { useQuery, useMutation } from "@tanstack/react-query";
import { conversationApi } from "@/lib/api";
import { Conversation } from "@/lib/types/conversation";

export const useConversationsByAccountIds = (accountIds: string[]) => {
  return useQuery<Conversation[]>({
    queryKey: ["conversations", accountIds],
    queryFn: () => conversationApi.findByAccountIds(accountIds),
    enabled: accountIds.length > 0,
  });
};

export const useConversationsByAccounts = (accountIds: string[]) => {
  const { data, isLoading, error, refetch } =
    useConversationsByAccountIds(accountIds);

  return {
    conversations: data || [],
    isLoading,
    error,
    refetch,
  };
};

export const useConversationById = (conversationId: string | number | null) => {
  return useQuery<Conversation | null>({
    queryKey: ["conversation", conversationId],
    queryFn: () =>
      conversationId
        ? conversationApi.findById(conversationId)
        : Promise.resolve(null),
    enabled: !!conversationId,
  });
};

export const useTogglePinConversation = () => {
  return useMutation({
    mutationFn: (conversationId: number) =>
      conversationApi.togglePin(conversationId),
  });
};
