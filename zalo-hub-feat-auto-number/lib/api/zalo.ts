import { QuoteMessage } from "@/hooks/use-chat-messages";
import { api } from "../api-client";
import axios from "axios";

const LISTENER_BASE_URL =
  process.env.NEXT_PUBLIC_LISTENER_URL || "http://localhost:3001";

export const zaloApi = {
  getQr: async () => {
    try {
      const response = await api.get<any>("/zalo/gen-qr");
      return response;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.response?.data?.message || "Không tạo được mã QR");
    }
  },

  checkLogin: async (sessionId: string) => {
    try {
      const response = await api.get<any>(
        `/zalo/check-login?sessionId=${sessionId}`
      );
      return response;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.response?.data?.message || "Không tạo được mã QR");
    }
  },

  syncFriend: async (accountId: string) => {
    try {
      const response = await api.get<any>(
        `/zalo/sync-friends?accountId=${accountId}`
      );
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Đông bộ bạn bè thất bại"
      );
    }
  },

  sendMessage: async (data: {
    accountId: number;
    friendZaloId: string;
    message: string;
    type?: string;
    quote?: QuoteMessage;
  }) => {
    try {
      const response = await api.post<any>("/zalo/send-message", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  },

  sendSticker: async (data: {
    accountId: number;
    friendZaloId: string;
    stickerId: number;
    cateId: number;
    type: number;
    stickerUrl: string;
    stickerSpriteUrl: string;
    stickerWebpUrl?: string;
  }) => {
    try {
      const response = await api.post<any>("/zalo/send-sticker", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gửi sticker thất bại");
    }
  },

  sendReaction: async (data: {
    accountId: number;
    threadId: string;
    type: number;
    msgId: string;
    cliMsgId: string;
    emoji: string;
  }) => {
    try {
      const response = await api.post<any>("/zalo/send-reaction", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gửi reaction thất bại");
    }
  },

  undoMessage: async (data: {
    accountId: number;
    threadId: string;
    type: number;
    msgId: string;
    cliMsgId: string;
  }) => {
    try {
      const response = await api.post<any>("/zalo/undo-message", data);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Gửi reaction thất bại");
    }
  },

  pinConversation: async (data: {
    accountId: number;
    threadId: string;
    isPinned: number;
  }) => {
    try {
      const response = await api.post<any>("/zalo/pin-conversation", data);
      return response;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Ghim hội thoại thất bại"
      );
    }
  },

  // Parse link preview
  parseLink: async (data: { accountId: number; url: string }) => {
    try {
      const response = await api.post<any>("/zalo/parse-link", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Parse link thất bại");
    }
  },

  // Get stickers by keyword
  getStickers: async (data: { accountId: number; keyword: string }) => {
    try {
      const response = await api.post<any>("/zalo/stickers", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Lấy stickers thất bại");
    }
  },

  // Gửi tin nhắn kèm file đính kèm (attachments)
  sendMessageWithAttachments: async ({
    accountId,
    friendZaloId,
    files,
  }: {
    accountId: number;
    friendZaloId: string;
    files: File[];
  }) => {
    const formData = new FormData();
    formData.append("accountId", accountId.toString());
    formData.append("friendZaloId", friendZaloId);
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // Gọi thẳng đến zalo-listener server
      const response = await axios.post<any>(
        `${LISTENER_BASE_URL}/zalo/send-message-with-attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.message || "Không gửi được file");
    }
  },

  // Gửi tin nhắn kèm file đính kèm (attachments)
  sendMessageWithVideo: async ({
    accountId,
    friendZaloId,
    file,
  }: {
    accountId: number;
    friendZaloId: string;
    file: File;
  }) => {
    const formData = new FormData();
    formData.append("accountId", accountId.toString());
    formData.append("friendZaloId", friendZaloId);
    formData.append("file", file);

    try {
      const response = await api.postForm<any>(
        "/zalo/send-message-with-video",
        formData
      );
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(error.message || "Không gửi được file");
    }
  },

  sendFriendRequest: async (data: {
    accountId: number;
    userId: string;
    friendId: number;
  }) => {
    try {
      const response = await api.post<any>("/zalo/send-friend-request", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message);
    }
  },

  acceptFriendRequest: async (data: { accountId: number; userId: string }) => {
    try {
      const response = await api.post<any>("/zalo/accept-friend-request", data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message);
    }
  },

  undoSentFriendRequest: async (data: {
    accountId: number;
    userId: string;
  }) => {
    try {
      const response = await api.post<any>(
        "/zalo/undo-sent-friend-request",
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message);
    }
  },
};
