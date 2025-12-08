import { api } from "../api-client";
import { User } from "../schemas/user";

export const authApi = {
  register: async (data: { name: string; email: string; password: string }) => {
    try {
      const response = await api.post<{ user: User }>("/auth/register", data);
      return response.user;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.response?.data?.message || "Đăng ký thất bại");
    }
  },

  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post<{
        access_token: string;
        refresh_token: string;
        user: User;
      }>("/auth/login", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  },

  verify: async (data: { access_token: string; refresh_token: string }) => {
    try {
      const response = await api.post<{
        access_token: string;
        refresh_token: string;
        user: User;
      }>("/auth/login", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Đăng nhập thất bại");
    }
  },
};
