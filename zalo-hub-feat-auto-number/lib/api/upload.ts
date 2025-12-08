import { api } from "../api-client";

export interface Folder {
  id: number;
  name: string;
  path: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadPermissions {
  id: number;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUploadPermissionsRequest {
  userId: number;
  canRead?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface UpdateUploadPermissionsRequest {
  canRead?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface InviteUserRequest {
  email: string;
  canRead?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const uploadApi = {
  permissions: {
    create: async (
      data: CreateUploadPermissionsRequest
    ): Promise<UploadPermissions> => {
      return await api.post<UploadPermissions>(`/upload-permissions`, data);
    },
    getAll: async (): Promise<UploadPermissions[]> => {
      return await api.get<UploadPermissions[]>(`/upload-permissions`);
    },
    getById: async (id: number): Promise<UploadPermissions> => {
      return await api.get<UploadPermissions>(`/upload-permissions/${id}`);
    },
    update: async (
      id: number,
      data: UpdateUploadPermissionsRequest
    ): Promise<UploadPermissions> => {
      return await api.put<UploadPermissions>(
        `/upload-permissions/${id}`,
        data
      );
    },
    remove: async (id: number): Promise<{ message: string }> => {
      return await api.delete<{ message: string }>(`/upload-permissions/${id}`);
    },
    inviteUser: async (data: InviteUserRequest): Promise<UploadPermissions> => {
      return await api.post<UploadPermissions>(
        `/upload-permissions/invite`,
        data
      );
    },
    getUsersWithPermissions: async (): Promise<UploadPermissions[]> => {
      return await api.get<UploadPermissions[]>(
        `/upload-permissions/users/with-permissions`
      );
    },
    checkPermission: async (
      userId: number,
      permission: "canRead" | "canCreate" | "canEdit" | "canDelete"
    ): Promise<{ hasPermission: boolean }> => {
      return await api.get<{ hasPermission: boolean }>(
        `/upload-permissions/check/${userId}?permission=${permission}`
      );
    },
  },
  createFolder: async (
    name: string,
    path?: string,
    description?: string
  ): Promise<Folder> => {
    return await api.post<Folder>(`/upload/folders`, {
      name,
      path,
      description,
    });
  },
  getFolders: async (): Promise<Folder[]> => {
    return await api.get<Folder[]>(`/upload/folders`);
  },
  renameFolder: async (id: number, name: string): Promise<Folder> => {
    return await api.put<Folder>(`/upload/folders/${id}/rename`, { name });
  },
  deleteFolder: async (id: number): Promise<{ message: string }> => {
    return await api.delete<{ message: string }>(`/upload/folders/${id}`);
  },
  deleteFile: async (
    path: string,
    name: string
  ): Promise<{ deleted: boolean }> => {
    const q = `?path=${encodeURIComponent(path)}&name=${encodeURIComponent(
      name
    )}`;
    return await api.delete<{ deleted: boolean }>(`/upload/files${q}`);
  },
  renameFile: async (
    path: string,
    oldName: string,
    newName: string
  ): Promise<{ renamed: boolean }> => {
    const q = `?path=${encodeURIComponent(path)}&old=${encodeURIComponent(
      oldName
    )}&new=${encodeURIComponent(newName)}`;
    return await api.put<{ renamed: boolean }>(`/upload/files/rename${q}`, {});
  },
  uploadFilesToFolder: async (
    folder: string,
    files: File[]
  ): Promise<{ urls: string[] }> => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    // Nếu có dấu '/', dùng query param path; nếu không, dùng route param để tương thích
    if (folder.includes("/")) {
      const search = `?path=${encodeURIComponent(folder)}`;
      return await api.postForm<{ urls: string[] }>(
        `/upload/files${search}`,
        form
      );
    }
    return await api.postForm<{ urls: string[] }>(
      `/upload/files/${encodeURIComponent(folder)}`,
      form
    );
  },
  list: async (
    path: string = "",
    options?: { sort?: "az" | "za" | "time_desc" | "time_asc"; q?: string }
  ): Promise<{
    path: string;
    folders: string[];
    foldersDetailed?: { name: string; mtimeMs: number }[];
    files: { name: string; url: string; size: number; mtimeMs: number }[];
  }> => {
    const params = new URLSearchParams();
    if (path) params.set("path", path);
    if (options?.sort) params.set("sort", options.sort);
    if (options?.q) params.set("q", options.q);
    const search = params.toString() ? `?${params.toString()}` : "";
    return await api.get(`/upload/list${search}`);
  },
};
