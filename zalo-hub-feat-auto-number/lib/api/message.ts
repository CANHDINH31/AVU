import { api } from "../api-client";
import { Message } from "../types/message";

export const messageApi = {
  findByConversationId: async (
    conversationId: string,
    params?: { beforeId?: number; limit?: number }
  ): Promise<{ messages: Message[]; hasNextPage: boolean }> => {
    try {
      const query = [];
      if (params?.beforeId) query.push(`beforeId=${params.beforeId}`);
      if (params?.limit) query.push(`limit=${params.limit}`);
      const queryString = query.length > 0 ? `?${query.join("&")}` : "";
      const response = await api.get<{
        messages: Message[];
        hasNextPage: boolean;
      }>(`/message/conversation/${conversationId}${queryString}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lấy tin nhắn thất bại");
    }
  },
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    try {
      await api.patch(`/message/conversation/${conversationId}/read`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Đánh dấu đã đọc thất bại"
      );
    }
  },
};
