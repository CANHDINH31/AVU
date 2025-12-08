import { api } from "../api-client";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const accessToken = Cookies.get("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export interface PhoneNumberMessage {
  id: number;
  content: string;
  type?: string;
  accountId?: number;
  status?: string;
  error?: string;
  mode?: "manual" | "auto";
  responsePayload?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDetail {
  id: number;
  phoneNumberId: number;
  phoneNumberStr: string;
  phone?: {
    id: number;
    phoneNumber: string;
    name: string | null;
    zaloName: string | null;
    avatar: string | null;
    notes: string | null;
    isFriend: boolean;
    hasScanInfo: boolean;
    lastMessageSentAt: string | null;
    lastMessageSuccess: boolean;
  };
  content: string;
  status: string;
  isSuccess: boolean | null;
  error: string | null;
  mode: "manual" | "auto";
  responsePayload: string | null;
  createdAt: string;
}

export interface PhoneNumber {
  id?: number;
  phoneNumber: string;
  name?: string;
  userId?: string;
  accountId?: number;
  avatar?: string;
  cover?: string;
  status?: string;
  gender?: number;
  dob?: number;
  sdob?: string;
  globalId?: string;
  bizPkg?: string;
  uid?: string;
  zaloName?: string;
  displayName?: string;
  isFriend?: boolean;
  hasSentFriendRequest?: number;
  accountDisplayName?: string;
  notes?: string;
  lastScannedAt?: string;
  scanCount?: number;
  hasScanInfo?: boolean;
  createdAt?: string;
  updatedAt?: string;
  messageHistory?: PhoneNumberMessage[];
  messagesSent?: number;
  lastMessageContent?: string;
  lastMessageAt?: string;
  lastMessageStatus?: string;
}

export interface PhoneNumbersListResponse {
  data: PhoneNumber[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreatePhoneNumberDto {
  phoneNumber: string;
  name?: string;
  notes?: string;
  accountId?: number;
}

export interface UpdatePhoneNumberDto {
  phoneNumber?: string;
  name?: string;
  notes?: string;
  accountId?: number;
}

export interface ImportExcelDto {
  file: File;
}

export interface GetPhoneNumbersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  accountId?: number;
  isFriend?: boolean;
  hasSentFriendRequest?: number;
  scannedStatus?: "scanned" | "notScanned";
  scannedFrom?: string;
  scannedTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: "lastScannedAt" | "createdAt";
  sortOrder?: "asc" | "desc";
  minScanCount?: number;
  maxScanCount?: number;
  hasScanInfo?: boolean;
  hasMessage?: boolean;
  lastMessageFrom?: string;
  lastMessageTo?: string;
  lastMessageStatus?:
    | "all"
    | "success"
    | "messageBlocked"
    | "strangerBlocked"
    | "noMsgId";
}

export const phoneNumbersApi = {
  // Lấy danh sách số điện thoại
  getAll: async ({
    page = 1,
    pageSize = 20,
    search,
    accountId,
    isFriend,
    hasSentFriendRequest,
    scannedStatus,
    scannedFrom,
    scannedTo,
    createdFrom,
    createdTo,
    sortBy,
    sortOrder,
    minScanCount,
    maxScanCount,
    hasScanInfo,
    hasMessage,
    lastMessageFrom,
    lastMessageTo,
    lastMessageStatus,
  }: GetPhoneNumbersParams = {}): Promise<PhoneNumbersListResponse> => {
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());
      if (search) {
        params.set("search", search);
      }
      if (accountId) {
        params.set("accountId", accountId.toString());
      }
      if (typeof isFriend === "boolean") {
        params.set("isFriend", String(isFriend));
      }
      if (
        typeof hasSentFriendRequest === "number" &&
        (hasSentFriendRequest === 0 || hasSentFriendRequest === 1)
      ) {
        params.set("hasSentFriendRequest", hasSentFriendRequest.toString());
      }
      if (scannedStatus) {
        params.set("scannedStatus", scannedStatus);
      }
      if (scannedFrom) {
        params.set("scannedFrom", scannedFrom);
      }
      if (scannedTo) {
        params.set("scannedTo", scannedTo);
      }
      if (createdFrom) {
        params.set("createdFrom", createdFrom);
      }
      if (createdTo) {
        params.set("createdTo", createdTo);
      }
      if (sortBy) {
        params.set("sortBy", sortBy);
      }
      if (sortOrder) {
        params.set("sortOrder", sortOrder);
      }
      if (typeof minScanCount === "number") {
        params.set("minScanCount", String(minScanCount));
      }
      if (typeof maxScanCount === "number") {
        params.set("maxScanCount", String(maxScanCount));
      }
      if (typeof hasScanInfo === "boolean") {
        params.set("hasScanInfo", String(hasScanInfo));
      }
      if (typeof hasMessage === "boolean") {
        params.set("hasMessage", String(hasMessage));
      }
      if (lastMessageFrom) {
        params.set("lastMessageFrom", lastMessageFrom);
      }
      if (lastMessageTo) {
        params.set("lastMessageTo", lastMessageTo);
      }
      if (lastMessageStatus && lastMessageStatus !== "all") {
        params.set("lastMessageStatus", lastMessageStatus);
      }
      const response = await api.get<PhoneNumbersListResponse>(
        `/phone-numbers?${params.toString()}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy danh sách số điện thoại thất bại"
      );
    }
  },

  // Lấy chi tiết một số điện thoại
  getById: async (id: number): Promise<PhoneNumber> => {
    try {
      const response = await api.get<PhoneNumber>(`/phone-numbers/${id}`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thông tin số điện thoại thất bại"
      );
    }
  },

  // Tạo mới số điện thoại
  create: async (data: CreatePhoneNumberDto): Promise<PhoneNumber> => {
    try {
      const response = await api.post<PhoneNumber>("/phone-numbers", data);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Tạo số điện thoại thất bại"
      );
    }
  },

  // Cập nhật số điện thoại
  update: async (
    id: number,
    data: UpdatePhoneNumberDto
  ): Promise<PhoneNumber> => {
    try {
      const response = await api.put<PhoneNumber>(`/phone-numbers/${id}`, data);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Cập nhật số điện thoại thất bại"
      );
    }
  },

  // Xóa số điện thoại
  delete: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(
        `/phone-numbers/${id}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Xóa số điện thoại thất bại"
      );
    }
  },

  // Xóa nhiều số điện thoại
  deleteMany: async (
    ids: number[]
  ): Promise<{
    message: string;
    success: number;
    failed: number;
    invalidIds: number[];
    errors: string[];
  }> => {
    try {
      const response = await api.post<{
        message: string;
        success: number;
        failed: number;
        invalidIds: number[];
        errors: string[];
      }>("/phone-numbers/bulk-delete", { ids });
      return response;
    } catch (error: any) {
      // Parse error response if available
      const errorData = error.response?.data;
      if (errorData?.success !== undefined) {
        // Backend returned partial success
        return errorData;
      }
      throw new Error(
        errorData?.message ||
          errorData?.errors?.join(", ") ||
          "Xóa số điện thoại thất bại"
      );
    }
  },

  // Import từ Excel
  importExcel: async (
    file: File,
    accountId: number
  ): Promise<{
    message: string;
    totalRows: number;
    batchesQueued: number;
    isProcessing: boolean;
  }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("accountId", accountId.toString());
      const response = await api.postForm<{
        message: string;
        totalRows: number;
        batchesQueued: number;
        isProcessing: boolean;
      }>("/phone-numbers/import-excel", formData);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Import Excel thất bại");
    }
  },

  // Export to Excel
  exportExcel: async (): Promise<Blob> => {
    try {
      const response = await axiosInstance.get("/phone-numbers/export-excel", {
        responseType: "blob",
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Export Excel thất bại");
    }
  },

  // Scan phone numbers
  scanPhoneNumbers: async (
    ids: number[],
    accountId: number
  ): Promise<{
    success: number;
    failed: number;
    errors?: string[];
  }> => {
    try {
      const response = await api.post<{
        success: number;
        failed: number;
        errors?: string[];
      }>("/phone-numbers/scan", { ids, accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Quét thông tin thất bại"
      );
    }
  },

  // Scan phone numbers with queue (slow scan)
  scanPhoneNumbersWithQueue: async (
    ids: number[],
    accountId: number
  ): Promise<{
    message: string;
    totalJobs: number;
    batches: number;
  }> => {
    try {
      const response = await api.post<{
        message: string;
        totalJobs: number;
        batches: number;
      }>("/phone-numbers/scan-queue", { ids, accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Quét thông tin thất bại"
      );
    }
  },

  // Scan all phone numbers with queue
  scanAllPhoneNumbersWithQueue: async (
    accountId: number
  ): Promise<{
    message: string;
    totalJobs: number;
    batches: number;
  }> => {
    try {
      const response = await api.post<{
        message: string;
        totalJobs: number;
        batches: number;
      }>("/phone-numbers/scan-all-queue", { accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Quét thông tin thất bại"
      );
    }
  },

  // Sync friends from Zalo
  syncFriends: async (
    accountId: number
  ): Promise<{
    message: string;
    totalFriends: number;
  }> => {
    try {
      const response = await api.post<{
        message: string;
        totalFriends: number;
      }>("/phone-numbers/sync-friends", { accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Đồng bộ bạn bè thất bại"
      );
    }
  },

  // Check and update friend status by comparing globalId
  checkAndUpdateFriendStatus: async (
    accountId: number
  ): Promise<{
    message: string;
    updated: number;
  }> => {
    try {
      const response = await api.post<{
        message: string;
        updated: number;
      }>("/phone-numbers/check-friend-status", { accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Kiểm tra trạng thái bạn bè thất bại"
      );
    }
  },

  // Send friend requests
  sendFriendRequests: async (
    ids: number[],
    accountId: number
  ): Promise<{
    success: number;
    failed: number;
    errors?: string[];
  }> => {
    try {
      const response = await api.post<{
        success: number;
        failed: number;
        errors?: string[];
      }>("/phone-numbers/send-friend-requests", { ids, accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Gửi lời mời kết bạn thất bại"
      );
    }
  },

  // Undo friend requests
  undoFriendRequests: async (
    ids: number[],
    accountId: number
  ): Promise<{
    success: number;
    failed: number;
    errors?: string[];
  }> => {
    try {
      const response = await api.post<{
        success: number;
        failed: number;
        errors?: string[];
      }>("/phone-numbers/undo-friend-requests", { ids, accountId });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Thu hồi lời mời kết bạn thất bại"
      );
    }
  },

  // Send bulk messages
  sendBulkMessages: async (
    ids: number[],
    accountId: number,
    message: string
  ): Promise<{
    success: number;
    failed: number;
    errors?: string[];
  }> => {
    try {
      const response = await api.post<{
        success: number;
        failed: number;
        errors?: string[];
      }>("/phone-numbers/send-bulk-messages", { ids, accountId, message });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Gửi tin nhắn hàng loạt thất bại"
      );
    }
  },

  // Get daily scan statistics
  getDailyStatistics: async (
    accountId: number,
    date?: string
  ): Promise<{
    date: string;
    totalScanned: number;
    withInfo: number;
    withoutInfo: number;
    dailyScanCount: number;
    manualScanCount: number;
    maxScansPerDay: number;
    remaining: number;
    scanEnabled: boolean;
    withInfoDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      scannedAt: string;
    }>;
    withoutInfoDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      scannedAt: string;
    }>;
    manualWithInfoDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      scannedAt: string;
    }>;
    manualWithoutInfoDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      scannedAt: string;
    }>;
    autoFriendRequestsSentToday: number;
    autoFriendRequestsCanceledToday: number;
    autoFriendRequestsSentTotal: number;
    autoFriendRequestsCanceledTotal: number;
    manualFriendRequestsSentToday: number;
    manualFriendRequestsCanceledToday: number;
    manualFriendRequestsSentTotal: number;
    manualFriendRequestsCanceledTotal: number;
    autoFriendRequestDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      actionAt: string;
    }>;
    autoFriendCancelDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      actionAt: string;
    }>;
    manualFriendRequestDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      actionAt: string;
    }>;
    manualFriendCancelDetails: Array<{
      phoneNumberId: number;
      phoneNumberStr: string;
      actionAt: string;
    }>;
    autoFriendRequestDailyLimit: number;
  }> => {
    try {
      const params = new URLSearchParams();
      params.set("accountId", accountId.toString());
      if (date) {
        params.set("date", date);
      }
      const response = await api.get<{
        date: string;
        totalScanned: number;
        withInfo: number;
        withoutInfo: number;
        dailyScanCount: number;
        manualScanCount: number;
        maxScansPerDay: number;
        remaining: number;
        scanEnabled: boolean;
        withInfoDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          scannedAt: string;
        }>;
        withoutInfoDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          scannedAt: string;
        }>;
        manualWithInfoDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          scannedAt: string;
        }>;
        manualWithoutInfoDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          scannedAt: string;
        }>;
        autoFriendRequestsSentToday: number;
        autoFriendRequestsCanceledToday: number;
        autoFriendRequestsSentTotal: number;
        autoFriendRequestsCanceledTotal: number;
        manualFriendRequestsSentToday: number;
        manualFriendRequestsCanceledToday: number;
        manualFriendRequestsSentTotal: number;
        manualFriendRequestsCanceledTotal: number;
        autoFriendRequestDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          actionAt: string;
        }>;
        autoFriendCancelDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          actionAt: string;
        }>;
        manualFriendRequestDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          actionAt: string;
        }>;
        manualFriendCancelDetails: Array<{
          phoneNumberId: number;
          phoneNumberStr: string;
          actionAt: string;
        }>;
        autoFriendRequestDailyLimit: number;
      }>(`/phone-numbers/daily-statistics?${params.toString()}`);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Lấy thống kê quét thất bại"
      );
    }
  },

  toggleDailyScan: async (
    accountId: number,
    enabled: boolean
  ): Promise<{ message: string; scanEnabled: boolean }> => {
    try {
      const response = await api.post<{
        message: string;
        scanEnabled: boolean;
      }>("/phone-numbers/toggle-daily-scan", { accountId, enabled });
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Cập nhật trạng thái quét thất bại"
      );
    }
  },

  // Export CSV with filters (no pagination)
  exportCsv: async (
    params: Omit<GetPhoneNumbersParams, "page" | "pageSize">
  ): Promise<Blob> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) {
        queryParams.set("search", params.search);
      }
      if (params.accountId) {
        queryParams.set("accountId", params.accountId.toString());
      }
      if (typeof params.isFriend === "boolean") {
        queryParams.set("isFriend", String(params.isFriend));
      }
      if (
        typeof params.hasSentFriendRequest === "number" &&
        (params.hasSentFriendRequest === 0 || params.hasSentFriendRequest === 1)
      ) {
        queryParams.set(
          "hasSentFriendRequest",
          params.hasSentFriendRequest.toString()
        );
      }
      if (params.scannedStatus) {
        queryParams.set("scannedStatus", params.scannedStatus);
      }
      if (params.scannedFrom) {
        queryParams.set("scannedFrom", params.scannedFrom);
      }
      if (params.scannedTo) {
        queryParams.set("scannedTo", params.scannedTo);
      }
      if (params.createdFrom) {
        queryParams.set("createdFrom", params.createdFrom);
      }
      if (params.createdTo) {
        queryParams.set("createdTo", params.createdTo);
      }
      if (params.sortBy) {
        queryParams.set("sortBy", params.sortBy);
      }
      if (params.sortOrder) {
        queryParams.set("sortOrder", params.sortOrder);
      }
      if (typeof params.minScanCount === "number") {
        queryParams.set("minScanCount", String(params.minScanCount));
      }
      if (typeof params.maxScanCount === "number") {
        queryParams.set("maxScanCount", String(params.maxScanCount));
      }
      if (typeof params.hasScanInfo === "boolean") {
        queryParams.set("hasScanInfo", String(params.hasScanInfo));
      }
      if (typeof params.hasMessage === "boolean") {
        queryParams.set("hasMessage", String(params.hasMessage));
      }
      if (params.lastMessageFrom) {
        queryParams.set("lastMessageFrom", params.lastMessageFrom);
      }
      if (params.lastMessageTo) {
        queryParams.set("lastMessageTo", params.lastMessageTo);
      }

      const response = await axiosInstance.get(
        `/phone-numbers/export-csv?${queryParams.toString()}`,
        {
          responseType: "blob",
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Export CSV thất bại");
    }
  },

  // Get message details
  getMessageDetails: async (
    accountId: number,
    mode: "manual" | "auto",
    date?: string
  ): Promise<MessageDetail[]> => {
    try {
      const params = new URLSearchParams();
      params.set("accountId", accountId.toString());
      params.set("mode", mode);
      if (date) {
        params.set("date", date);
      }
      const response = await api.get<MessageDetail[]>(
        `/phone-numbers/message-details?${params.toString()}`
      );
      // Đảm bảo luôn trả về một mảng, không bao giờ undefined
      return Array.isArray(response) ? response : [];
    } catch (error: any) {
      // Trả về mảng rỗng thay vì throw error để query không bị undefined
      console.error("Error fetching message details:", error);
      return [];
    }
  },
};
