import { api } from "../api-client";
import { FriendRequestsListResponse } from "../types/api";

export const friendRequestApi = {
  findByAccountIds: async (
    accountIds: string[],
    search?: string
  ): Promise<FriendRequestsListResponse> => {
    try {
      const url = search
        ? `/friend-request/accounts?search=${encodeURIComponent(search)}`
        : `/friend-request/accounts`;
      const response = await api.post<FriendRequestsListResponse>(url, {
        accountIds,
      });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lấy danh sách yêu cầu kết bạn thất bại"
      );
    }
  },
};
