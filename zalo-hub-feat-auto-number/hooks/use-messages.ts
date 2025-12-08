import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { messageApi } from "@/lib/api";
import { Message } from "@/lib/types/message";
import { zaloApi } from "@/lib/api/zalo";

export const useMessages = (
  conversationId: string | null,
  limit: number = 50
) => {
  return useInfiniteQuery<{ messages: Message[]; hasNextPage: boolean }, Error>(
    {
      queryKey: ["messages", conversationId],
      queryFn: async ({ pageParam }) => {
        return messageApi.findByConversationId(
          conversationId!,
          pageParam as { beforeId?: number; limit?: number }
        );
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage || !lastPage.messages || lastPage.messages.length === 0)
          return undefined;
        // Sử dụng hasNextPage từ backend trả về
        if (!lastPage.hasNextPage) return undefined;
        // Lấy id nhỏ nhất của page cuối cùng làm cursor cho lần sau
        return { beforeId: lastPage.messages[0].id, limit };
      },
      initialPageParam: { limit },
      enabled: !!conversationId,
      staleTime: 0,
      refetchOnMount: "always",
    }
  );
};

export const useSendZaloMessage = () => {
  return useMutation({
    mutationFn: zaloApi.sendMessage,
  });
};
