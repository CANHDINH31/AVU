import { api } from "../api-client";

export interface UserRank {
  id: number;
  name: string;
  displayName: string;
  maxAccounts: number;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRankStats {
  rank: UserRank;
  userCount: number;
}

export interface CreateUserRankDto {
  name: string;
  displayName: string;
  maxAccounts: number;
  order: number;
}

export interface UpdateUserRankDto {
  name?: string;
  displayName?: string;
  maxAccounts?: number;
  order?: number;
}

export const userRankApi = {
  getAll: async (): Promise<UserRank[]> => {
    try {
      return api.get<UserRank[]>("/user-ranks");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách rank thất bại"
      );
    }
  },

  getById: async (id: number): Promise<UserRank> => {
    try {
      return api.get<UserRank>(`/user-ranks/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thông tin rank thất bại"
      );
    }
  },

  create: async (data: CreateUserRankDto): Promise<UserRank> => {
    try {
      return api.post<UserRank>("/user-ranks", data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Tạo rank thất bại"
      );
    }
  },

  update: async (id: number, data: UpdateUserRankDto): Promise<UserRank> => {
    try {
      return api.patch<UserRank>(`/user-ranks/${id}`, data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Cập nhật rank thất bại"
      );
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await api.delete(`/user-ranks/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Xóa rank thất bại"
      );
    }
  },

  getStats: async (): Promise<UserRankStats[]> => {
    try {
      return api.get<UserRankStats[]>("/user-ranks/stats");
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thống kê rank thất bại"
      );
    }
  },
};

