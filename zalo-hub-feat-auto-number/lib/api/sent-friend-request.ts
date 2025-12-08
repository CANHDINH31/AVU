import { api } from "../api-client";
import { SentFriendRequestsListResponse } from "../types/api";

export const sentFriendRequestApi = {
  findByAccountIds: async (
    accountIds: string[],
    search?: string
  ): Promise<SentFriendRequestsListResponse> => {
    try {
      const url = search
        ? `/sent-friend-request/accounts?search=${encodeURIComponent(search)}`
        : `/sent-friend-request/accounts`;
      const response = await api.post<SentFriendRequestsListResponse>(url, {
        accountIds,
      });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách lời mời đã gửi thất bại"
      );
    }
  },
};
