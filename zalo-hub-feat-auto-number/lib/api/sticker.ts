import { api } from "../api-client";

export interface Sticker {
  id: number;
  stickerId: number;
  cateId: number;
  type: number;
  stickerUrl: string;
  stickerSpriteUrl: string;
  totalFrames: number;
  duration: number;
  stickerWebpUrl?: string;
}

export const stickerApi = {
  getAll: async () => {
    try {
      const response = await api.get<Sticker[]>("/sticker");
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy danh sách sticker"
      );
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get<number[]>("/sticker/categories");
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy danh mục sticker"
      );
    }
  },

  getByCategory: async (cateId: number) => {
    try {
      const response = await api.get<Sticker[]>(`/sticker/category/${cateId}`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi lấy sticker theo danh mục"
      );
    }
  },

  searchByCategoryId: async (categoryId: string) => {
    try {
      const response = await api.get<Sticker[]>(
        `/sticker/search/category/${categoryId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tìm kiếm sticker theo category ID"
      );
    }
  },

  searchByStickerId: async (stickerId: string) => {
    try {
      const response = await api.get<Sticker[]>(
        `/sticker/search/sticker/${stickerId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Lỗi khi tìm kiếm sticker theo sticker ID"
      );
    }
  },
};
