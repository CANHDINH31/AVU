import { api } from "../api-client";

export const reactionApi = {
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    try {
      await api.patch(`/reaction/conversation/${conversationId}/read`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Đánh dấu đã đọc thất bại"
      );
    }
  },
};
