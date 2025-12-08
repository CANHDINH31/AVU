import { api } from "../api-client";

export interface SharedFolder {
  id: string;
  name: string;
  path: string;
  type: "folder" | "file";
  children?: SharedFolder[];
  isExpanded?: boolean;
  size?: number;
  lastModified?: string;
  permissions?: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

export interface SharedFolderRequest {
  accountId: number;
  path?: string;
}

export interface SharedFolderResponse {
  folders: SharedFolder[];
  totalCount: number;
}

export interface SendSharedFolderRequest {
  accountId: number;
  conversationId: string;
  folderId: string;
  message?: string;
}

export interface SendSharedFolderResponse {
  success: boolean;
  messageId: string;
  folder: SharedFolder;
}

export const sharedFolderApi = {
  // Lấy danh sách thư mục dùng chung
  getSharedFolders: async (
    request: SharedFolderRequest
  ): Promise<SharedFolderResponse> => {
    return await api.get<SharedFolderResponse>(
      `/shared-folders/${request.accountId}`,
      request.path ? { path: request.path } : undefined
    );
  },

  // Lấy chi tiết thư mục
  getFolderDetails: async (
    folderId: string,
    accountId: number
  ): Promise<SharedFolder> => {
    return await api.get<SharedFolder>(
      `/shared-folders/${accountId}/${folderId}`
    );
  },

  // Tìm kiếm thư mục
  searchFolders: async (
    query: string,
    accountId: number
  ): Promise<SharedFolder[]> => {
    return await api.get<SharedFolder[]>(
      `/shared-folders/${accountId}/search`,
      { q: query }
    );
  },

  // Gửi tin nhắn với thư mục dùng chung
  sendSharedFolder: async (
    request: SendSharedFolderRequest
  ): Promise<SendSharedFolderResponse> => {
    return await api.post<SendSharedFolderResponse>(
      "/messages/shared-folder",
      request
    );
  },

  // Tạo thư mục dùng chung mới
  createSharedFolder: async (
    name: string,
    parentId: string | null,
    accountId: number
  ): Promise<SharedFolder> => {
    return await api.post<SharedFolder>("/shared-folders", {
      name,
      parentId,
      accountId,
    });
  },

  // Upload file vào thư mục dùng chung
  uploadToSharedFolder: async (
    folderId: string,
    file: File,
    accountId: number
  ): Promise<SharedFolder> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId);
    formData.append("accountId", accountId.toString());
    return await api.postForm<SharedFolder>("/shared-folders/upload", formData);
  },

  // Xóa thư mục hoặc file
  deleteSharedItem: async (
    itemId: string,
    accountId: number
  ): Promise<{ success: boolean }> => {
    return await api.delete<{ success: boolean }>(
      `/shared-folders/${accountId}/${itemId}`
    );
  },

  // Cập nhật quyền truy cập thư mục
  updateFolderPermissions: async (
    folderId: string,
    permissions: { read: boolean; write: boolean; delete: boolean },
    accountId: number
  ): Promise<SharedFolder> => {
    return await api.put<SharedFolder>(
      `/shared-folders/${accountId}/${folderId}/permissions`,
      { permissions }
    );
  },
};
