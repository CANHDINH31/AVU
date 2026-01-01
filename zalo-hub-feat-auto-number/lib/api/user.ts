import { api } from "../api-client";
import { User } from "../schemas/user";

export interface UserWithRole extends User {
  role: string;
  active: number;
  rankId?: number;
  rank?: {
    id: number;
    name: string;
    displayName: string;
    maxAccounts: number;
    order: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedUsersResponse {
  data: UserWithRole[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const userApi = {
  searchUsers: async (params?: {
    search?: string; // unified search for name/email
    name?: string;
    email?: string;
    role?: "admin" | "manager" | "user";
    active?: 0 | 1;
    all?: 0 | 1; // get all users without filtering
  }): Promise<UserWithRole[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.name) queryParams.append("name", params.name);
    if (params?.active !== undefined)
      queryParams.append("active", String(params.active));
    if (params?.all !== undefined)
      queryParams.append("all", String(params.all));
    const url = `/user/search${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return api.get<UserWithRole[]>(url);
  },
  update: async (id: string, data: Partial<Omit<User, "id">>) => {
    try {
      const response = await api.put<{ user: User }>(`/user/${id}`, data);
      return response.user;
    } catch (error: any) {
      console.error(error);
      throw new Error(error.response?.data?.message || "Cập nhật thất bại");
    }
  },

  // Admin functions
  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    active?: number;
    role?: string;
    rankId?: number;
  }): Promise<PaginatedUsersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.active !== undefined)
        queryParams.append("active", params.active.toString());
      if (params?.role) queryParams.append("role", params.role);
      if (params?.rankId !== undefined)
        queryParams.append("rankId", params.rankId.toString());

      const url = `/admin/users${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await api.get<PaginatedUsersResponse>(url);
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Lấy danh sách người dùng thất bại"
      );
    }
  },

  getUserById: async (id: string): Promise<UserWithRole> => {
    try {
      const response = await api.get<UserWithRole>(`/admin/users/${id}`);
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Lấy thông tin người dùng thất bại"
      );
    }
  },

  updateUserRole: async (id: string, role: string): Promise<UserWithRole> => {
    try {
      const response = await api.put<UserWithRole>(`/admin/users/${id}/role`, {
        role,
      });
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Cập nhật quyền người dùng thất bại"
      );
    }
  },

  updateUserRank: async (id: string, rankId: number): Promise<UserWithRole> => {
    try {
      const response = await api.put<UserWithRole>(`/admin/users/${id}/rank`, {
        rankId,
      });
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Cập nhật rank người dùng thất bại"
      );
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/users/${id}`);
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Xóa người dùng thất bại"
      );
    }
  },

  createUser: async (userData: {
    email: string;
    name: string;
    password: string;
    role?: string;
  }): Promise<UserWithRole> => {
    try {
      const response = await api.post<UserWithRole>("/admin/users", userData);
      return response;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Tạo người dùng thất bại"
      );
    }
  },

  activateUser: async (id: string): Promise<UserWithRole> => {
    try {
      const response = await api.put<UserWithRole>(
        `/admin/users/${id}/activate`
      );
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Kích hoạt người dùng thất bại"
      );
    }
  },

  deactivateUser: async (id: string): Promise<UserWithRole> => {
    try {
      const response = await api.put<UserWithRole>(
        `/admin/users/${id}/deactivate`
      );
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Vô hiệu hóa người dùng thất bại"
      );
    }
  },

  getAllUsersStats: async (): Promise<any> => {
    try {
      const response = await api.get("/admin/users/stats");
      return response;
    } catch (error: any) {
      console.error(error);
      throw new Error(
        error.response?.data?.message || "Lấy thống kê người dùng thất bại"
      );
    }
  },

  changePassword: async (
    id: string,
    newPassword: string
  ): Promise<UserWithRole> => {
    try {
      const response = await api.put<UserWithRole>(
        `admin/users/${id}/change-password`,
        { newPassword }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  },

  // Self-service: change own password (requires currentPassword)
  changeMyPassword: async (
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserWithRole> => {
    try {
      const response = await api.put<UserWithRole>(
        `/user/${id}/change-password`,
        { currentPassword, newPassword }
      );
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  },
};
