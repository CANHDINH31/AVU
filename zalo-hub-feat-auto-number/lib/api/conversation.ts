import { api } from "../api-client";
import { Conversation } from "../types/conversation";

export const conversationApi = {
  // Lấy tất cả conversations theo nhiều account ID (endpoint mới)
  findByAccountIds: async (accountIds: string[]): Promise<Conversation[]> => {
    try {
      const url = `/conversation/accounts`;
      const response = await api.post<Conversation[]>(url, {
        accountIds,
      });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách bạn bè thất bại"
      );
    }
  },

  findById: async (id: string | number): Promise<Conversation> => {
    try {
      const url = `/conversation/${id}`;
      const response = await api.get<Conversation>(url);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lấy thông tin cuộc trò chuyện thất bại"
      );
    }
  },

  findByFriendIdAndAccountId: async (
    friendId: number,
    accountId: number
  ): Promise<Conversation> => {
    try {
      const url = `/conversation/by-friend-and-account`;
      const response = await api.post<Conversation>(url, {
        friendId,
        accountId,
      });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lấy thông tin cuộc trò chuyện thất bại"
      );
    }
  },

  togglePin: async (conversationId: number): Promise<Conversation> => {
    try {
      const url = `/conversation/${conversationId}/pin`;
      const response = await api.patch<Conversation>(url);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Thao tác ghim hội thoại thất bại"
      );
    }
  },
};
