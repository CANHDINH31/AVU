import { api } from "../api-client";
import { FriendsListResponse } from "../types/api";
import { Friend } from "../types/friend";

export const friendApi = {
  // Lấy tất cả friends theo account ID
  findByAccountId: async (accountId: number): Promise<FriendsListResponse> => {
    try {
      const response = await api.get<FriendsListResponse>(
        `/friend/account/${accountId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách bạn bè thất bại"
      );
    }
  },

  // Lấy tất cả friends theo nhiều account ID (endpoint mới)
  findByAccountIds: async (
    accountIds: string[],
    search?: string
  ): Promise<FriendsListResponse> => {
    try {
      const url = search
        ? `/friend/accounts?search=${encodeURIComponent(search)}`
        : `/friend/accounts`;
      const response = await api.post<FriendsListResponse>(url, { accountIds });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách bạn bè thất bại"
      );
    }
  },

  // Lấy thông tin friend theo userId
  findByUidFrom: async (uidFrom: string): Promise<Friend[]> => {
    try {
      const response = await api.get<Friend[]>(
        `/friend/find-uidfrom/${uidFrom}`
      );
      return response;
    } catch (error: any) {
      // Nếu không tìm thấy friend, trả về mảng rỗng thay vì throw error
      if (error.response?.status === 404) {
        return [];
      }
      throw new Error(
        error.response?.data?.message || "Lấy thông tin bạn bè thất bại"
      );
    }
  },
};
