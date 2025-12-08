import { api } from "../api-client";
import {
  CreateAccountInput,
  UpdateAccountInput,
  createAccountSchema,
  updateAccountSchema,
} from "../schemas/account";
import { Account } from "../types/account";

interface ApiResponse<T> {
  data: T;
}

export const accountApi = {
  create: async (data: CreateAccountInput): Promise<Account> => {
    try {
      const validatedData = createAccountSchema.parse(data);
      const response = await api.post<Account>("/account", validatedData);
      return response;
    } catch (error: any) {
      if (error.name === "ZodError") {
        throw new Error(
          "Dữ liệu không hợp lệ: " +
            error.errors.map((e: any) => e.message).join(", ")
        );
      }
      throw new Error(
        error.response?.data?.message || "Tạo tài khoản thất bại"
      );
    }
  },

  findAll: async (): Promise<Account[]> => {
    try {
      const response = await api.get<ApiResponse<Account[]>>("/account");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách tài khoản thất bại"
      );
    }
  },

  findOne: async (id: number): Promise<Account> => {
    try {
      const response = await api.get<ApiResponse<Account>>(`/account/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thông tin tài khoản thất bại"
      );
    }
  },

  update: async (id: number, data: UpdateAccountInput): Promise<Account> => {
    try {
      const validatedData = updateAccountSchema.parse(data);
      const response = await api.put<ApiResponse<Account>>(
        `/account/${id}`,
        validatedData
      );
      return response.data;
    } catch (error: any) {
      if (error.name === "ZodError") {
        throw new Error(
          "Dữ liệu không hợp lệ: " +
            error.errors.map((e: any) => e.message).join(", ")
        );
      }
      throw new Error(
        error.response?.data?.message || "Cập nhật tài khoản thất bại"
      );
    }
  },

  remove: async (id: number): Promise<boolean> => {
    try {
      await api.delete(`/account/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Xóa tài khoản thất bại"
      );
    }
  },

  me: async (search?: string, userId?: number): Promise<Account[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (userId && userId > 0) params.append("userId", userId.toString());

      const response = await api.get<Account[]>(
        `/account/me${params.toString() ? `?${params.toString()}` : ""}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lấy thông tin tài khoản hiện tại thất bại"
      );
    }
  },

  getFilterableUsers: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>("/account/filterable-users");
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lấy danh sách người dùng có thể lọc thất bại"
      );
    }
  },

  updateSettings: async (
    id: number,
    settings: {
      autoFriendRequestEnabled?: boolean;
      friendRequestStartTime?: string;
      autoMessageEnabled?: boolean;
      bulkMessageContent?: string;
    }
  ): Promise<Account> => {
    try {
      const response = await api.patch<ApiResponse<Account>>(
        `/account/${id}/settings`,
        settings
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Cập nhật cài đặt tài khoản thất bại"
      );
    }
  },
};
