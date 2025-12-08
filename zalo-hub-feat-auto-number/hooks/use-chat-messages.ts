import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useMessages, useSendZaloMessage } from "@/hooks/use-messages";
import { useSocket } from "@/hooks/use-socket";
import { getUser } from "@/lib/auth";
import { messageApi, zaloApi } from "@/lib/api";

export interface Message {
  id: number | string;

  // Sender & Receiver
  uidFrom?: string;
  idTo?: string;
  sender?: "me" | "other";
  isSelf?: number;
  senderName?: string;
  senderAvatar?: string;
  accountName?: string;

  // Metadata
  type?: number | "text" | "image" | "file" | "voice";
  msgType?: string;
  msgId?: string;
  cliMsgId?: string;
  threadId?: string;
  actionId?: string;
  conversationId?: number;
  conversation?: any;
  status?: number;
  messageStatus?: "sending" | "sent" | "failed";
  isExpired?: number; // 1: còn hạn, 0: hết hạn
  ts?: string;
  createdAt?: string;
  updatedAt?: string;
  propertyExtJson?: string;
  contentJson?: string;
  ttl?: number;

  // Content
  content: string;
  title?: string;
  description?: string;
  href?: string;
  thumb?: string;

  // Reply & Reactions
  replyTo?: Message;
  reactions?: { emoji: string; users: string[] }[] | any[];
  isPinned?: boolean;
  isRecalled?: boolean;

  // File/Image/Voice
  fileName?: string;
  fileSize?: string;
  fileExt?: string;
  imageUrl?: string;
  voiceUrl?: string;
  duration?: string;
  fdata?: string;
  fType?: number;
  tWidth?: number;
  tHeight?: number;

  // Sticker
  stickerUrl?: string;
  stickerSpriteUrl?: string;
  stickerTotalFrames?: number;
  stickerDuration?: number;

  // Others
  checkSum?: string;
  checksumSha?: string;
  undo?: number;
  childnumber?: number;
  action?: string;
  params?: string;
  dName?: string;

  time?: string;
}

export interface QuoteMessage {
  contentJson?: string;
  msgType?: string;
  propertyExtJson?: string;
  uidFrom?: string;
  msgId?: string;
  cliMsgId?: string;
  ts?: string;
  ttl?: number;
}

export function useChatMessages(
  conversationId: string | null,
  conversationInfo: any
) {
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useMessages(conversationId);

  const [incomingMessages, setIncomingMessages] = useState<Message[]>([]);
  const [sendingMessages, setSendingMessages] = useState<Message[]>([]);
  const isTabVisibleRef = useRef(true);
  const { onNewMessage, removeEventListener } = useSocket();
  const sendZaloMessage = useSendZaloMessage();
  const user = typeof window !== "undefined" ? getUser() : null;
  const handleNewMessageRef = useRef<any>(null);

  // Nối các page lại thành 1 mảng messages, đảm bảo cũ đến mới
  const messages: Message[] = useMemo(() => {
    if (!data?.pages) return [];
    // Đảo ngược pages để page cũ nhất lên đầu, page mới nhất ở cuối
    return data.pages
      .slice()
      .reverse()
      .flatMap((page: any) => page.messages)
      .map((msg: any) => ({
        id: msg.id.toString(),
        sender: msg.isSelf === 1 ? "me" : "other",
        content: msg.content,
        time: msg.createdAt || msg.ts,
        reactions: msg?.reactions,
        title: msg?.title,
        description: msg?.description,
        href: msg?.href,
        thumb: msg?.thumb,
        childnumber: msg?.childnumber,
        action: msg?.action,
        params: msg?.params,
        threadId: msg?.threadId,
        type: msg?.type,
        msgType: msg?.msgType,
        msgId: msg?.msgId,
        cliMsgId: msg?.cliMsgId,
        stickerUrl: msg?.stickerUrl,
        stickerSpriteUrl: msg?.stickerSpriteUrl,
        stickerTotalFrames: msg?.stickerTotalFrames,
        stickerDuration: msg?.stickerDuration,
        fileSize: msg?.fileSize,
        checkSum: msg?.checksum,
        checksumSha: msg?.checksumSha,
        fileExt: msg?.fileExt,
        fdata: msg?.fdata,
        fType: msg?.fType,
        tWidth: msg?.tWidth,
        tHeight: msg?.tHeight,
        undo: msg?.undo,
        replyTo: msg?.replyTo,
        contentJson: msg?.contentJson,
        propertyExtJson: msg?.propertyExtJson,
        uidFrom: msg?.uidFrom,
        ts: msg?.ts,
        ttl: msg?.ttl,
        messageStatus: msg?.messageStatus, // Lưu trạng thái message
        source: msg?.source, // Lưu nguồn message (backend/socket)
        isExpired: msg?.isExpired, // Trạng thái hết hạn (1: còn hạn, 0: hết hạn)
      }));
  }, [data]);

  useEffect(() => {
    setIncomingMessages([]);
    setSendingMessages([]);
    // Reset visibility state when conversation changes
    isTabVisibleRef.current = !document.hidden;
  }, [conversationId]);

  // Track tab visibility and clear incoming messages when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasHidden = !isTabVisibleRef.current;
      const isNowVisible = !document.hidden;

      isTabVisibleRef.current = isNowVisible;

      // Only clear incoming messages when tab becomes visible and there are messages to clear
      if (wasHidden && isNowVisible && incomingMessages.length > 0) {
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
          setIncomingMessages([]);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [incomingMessages.length]);

  useEffect(() => {
    if (!conversationId || !conversationInfo?.account_id) return;
    const accId = Number(conversationInfo.account_id);
    const handleNewMessage = async (msg: any) => {
      const newMsg: Message = {
        id: msg.id.toString(),
        sender: msg.isSelf === true ? "me" : "other",
        content: msg.content,
        time: msg.time,
        type: msg.type,
        messageStatus: msg?.messageStatus,
        reactions: msg?.reactions,
        title: msg?.title,
        description: msg?.description,
        href: msg?.href,
        thumb: msg?.thumb,
        childnumber: msg?.childnumber,
        action: msg?.action,
        params: msg?.params,
        threadId: msg?.threadId,
        msgType: msg?.msgType,
        msgId: msg?.msgId,
        cliMsgId: msg?.cliMsgId,
        stickerUrl: msg?.stickerUrl,
        stickerSpriteUrl: msg?.stickerSpriteUrl,
        stickerTotalFrames: msg?.stickerTotalFrames,
        stickerDuration: msg?.stickerDuration,
        fileSize: msg?.fileSize,
        checkSum: msg?.checksum,
        checksumSha: msg?.checksumSha,
        fileExt: msg?.fileExt,
        fdata: msg?.fdata,
        fType: msg?.fType,
        tWidth: msg?.tWidth,
        tHeight: msg?.tHeight,
        undo: msg?.undo,
        replyTo: msg?.replyTo,
        contentJson: msg?.contentJson,
        propertyExtJson: msg?.propertyExtJson,
        uidFrom: msg?.uidFrom,
        ts: msg?.ts,
        ttl: msg?.ttl,
      };

      if (msg.isSelf === true) {
        setSendingMessages((prev) =>
          prev.filter((sendingMsg) => sendingMsg.content !== msg.content)
        );
      }

      // Khi socket trả về message thật: loại bỏ temp đang "sending" tương ứng (tránh bị nhân đôi)
      if (Number(conversationId) === Number(msg.conversationId)) {
        setSendingMessages((prev) => {
          // So khớp cho sticker: dựa vào msgType và stickerUrl (vì content rỗng)
          if (newMsg.msgType === "chat.sticker" && newMsg.stickerUrl) {
            return prev.filter(
              (m) =>
                !(
                  m.sender === "me" &&
                  m.messageStatus === "sending" &&
                  m.msgType === "chat.sticker" &&
                  (m as any).stickerUrl === newMsg.stickerUrl
                )
            );
          }
          // So khớp cho text: dựa vào content
          if (!newMsg.msgType || newMsg.msgType === "chat.msg") {
            return prev.filter(
              (m) =>
                !(
                  m.sender === "me" &&
                  m.messageStatus === "sending" &&
                  m.content === newMsg.content
                )
            );
          }
          return prev;
        });

        // Thêm message thật vào incoming để hiển thị ngay
        setIncomingMessages((prev) => [...prev, newMsg]);
        await messageApi.markConversationAsRead(conversationId);
      }
    };
    handleNewMessageRef.current = handleNewMessage;
    onNewMessage(accId, handleNewMessage);
    return () => {
      if (handleNewMessageRef.current) {
        removeEventListener(accId, "new_message", handleNewMessageRef.current);
      }
    };
  }, [
    conversationId,
    conversationInfo?.account_id,
    onNewMessage,
    removeEventListener,
  ]);

  const handleSendMessage = useCallback(
    async (
      newMessage: string | any,
      resetInput: () => void,
      resetReply: () => void,
      type?: string,
      quote?: Message
    ) => {
      if (!user) return;

      // Xử lý sticker
      if (type === "sticker" && newMessage.stickerUrl) {
        const tempStickerMessage: Message = {
          id: `temp-sticker-${Date.now()}`,
          sender: "me",
          content: "",
          time: new Date().toISOString(),
          type: "image",
          msgType: "chat.sticker",
          messageStatus: "sending",
          stickerId: newMessage.stickerId,
          cateId: newMessage.cateId,
          stickerType: newMessage.type,
          stickerUrl: newMessage.stickerUrl,
          stickerSpriteUrl: newMessage.stickerSpriteUrl,
          stickerWebpUrl: newMessage.stickerWebpUrl,
        } as any;

        setSendingMessages((prev) => [...prev, tempStickerMessage]);

        if (conversationInfo?.account_id && conversationInfo?.friend?.userKey) {
          zaloApi
            .sendSticker({
              accountId: Number(conversationInfo.account_id),
              friendZaloId: conversationInfo.friend.userKey,
              stickerId: newMessage.stickerId,
              cateId: newMessage.cateId,
              type: newMessage.type,
              stickerUrl: newMessage.stickerUrl,
              stickerSpriteUrl: newMessage.stickerSpriteUrl,
              stickerWebpUrl: newMessage.stickerWebpUrl,
            })
            .catch(async () => {
              setSendingMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempStickerMessage.id
                    ? { ...msg, messageStatus: "failed" }
                    : msg
                )
              );
              try {
                await refetch();
              } catch {}
            });
        }
        resetReply();
        return;
      }

      // Xử lý attachments
      if (type === "attachments") {
        if (conversationInfo?.account_id) {
          try {
            await zaloApi.sendMessageWithAttachments({
              accountId: Number(conversationInfo.account_id),
              friendZaloId: conversationInfo.friend.userKey,
              files: newMessage,
            });
          } catch (error: any) {
            // Throw error để component cha có thể xử lý
            throw error;
          }
        }
        resetReply();
        return;
      }

      // Xử lý shared-folder -> chuyển danh sách item (file URLs) thành File[] rồi gửi attachments
      if (type === "shared-folder") {
        const items: any[] = Array.isArray(newMessage) ? newMessage : [];
        if (items.length > 0 && conversationInfo?.account_id) {
          const files: File[] = [];
          const failedFiles: string[] = [];

          // Fetch từng file từ URL
          for (const it of items) {
            if (it?.type === "file" && it?.path) {
              try {
                const res = await fetch(it.path);
                if (!res.ok) {
                  // Nếu response không OK, throw error
                  failedFiles.push(it.name || it.path);
                  continue;
                }
                const blob = await res.blob();
                const file = new File([blob], it.name || "file", {
                  type: blob.type || undefined,
                });
                files.push(file);
              } catch (error: any) {
                // Track file failed để báo lỗi
                failedFiles.push(it.name || it.path);
                console.error(
                  `Lỗi khi fetch file ${it.name || it.path}:`,
                  error
                );
              }
            }
          }

          // Nếu có file nào fetch failed, throw error
          if (failedFiles.length > 0) {
            const error = new Error(
              `Không thể tải ${failedFiles.length} file: ${failedFiles.join(
                ", "
              )}`
            );
            throw error;
          }

          // Nếu không có file nào fetch được, throw error
          if (files.length === 0) {
            throw new Error("Không thể tải file từ shared folder");
          }

          // Gửi files qua API
          try {
            await zaloApi.sendMessageWithAttachments({
              accountId: Number(conversationInfo.account_id),
              friendZaloId: conversationInfo.friend.userKey,
              files,
            });
          } catch (error: any) {
            // Throw error để component cha có thể xử lý
            throw error;
          }
        }
        resetReply();
        return;
      }

      // Xử lý video`
      if (type === "video") {
        if (conversationInfo?.account_id) {
          try {
            await zaloApi.sendMessageWithVideo({
              accountId: Number(conversationInfo.account_id),
              friendZaloId: conversationInfo.friend.userKey,
              file: newMessage,
            });
          } catch (error: any) {
            // Throw error để component cha có thể xử lý
            throw error;
          }
        }
        resetReply();
        return;
      }

      // Xử lý text message (link)
      if (!newMessage.trim()) return;
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        sender: "me",
        content: newMessage,
        time: new Date().toISOString(),
        type: "text",
        messageStatus: "sending",
        replyTo: quote,
      };

      if (type !== "link") {
        setSendingMessages((prev) => [...prev, tempMessage]);
      }

      if (conversationInfo?.account_id && conversationInfo?.friend?.userKey) {
        sendZaloMessage.mutate(
          {
            accountId: Number(conversationInfo.account_id),
            friendZaloId: conversationInfo.friend.userKey,
            message: newMessage,
            type,
            quote: {
              contentJson: quote?.contentJson,
              msgType: quote?.msgType,
              propertyExtJson: quote?.propertyExtJson,
              uidFrom: quote?.uidFrom,
              msgId: quote?.msgId,
              cliMsgId: quote?.cliMsgId,
              ts: quote?.ts,
              ttl: quote?.ttl,
            },
          },
          {
            onError: () => {
              setSendingMessages((prev) =>
                prev.map((msg) =>
                  msg.content === newMessage && msg.messageStatus === "sending"
                    ? { ...msg, messageStatus: "failed" }
                    : msg
                )
              );
            },
          }
        );
      }
      resetInput();
      resetReply();
    },
    [user, conversationInfo, sendZaloMessage]
  );

  const allMessages = useMemo(() => {
    return [...messages, ...incomingMessages, ...sendingMessages];
  }, [messages, incomingMessages, sendingMessages]);

  useEffect(() => {
    if (!isLoading && data) {
      setSendingMessages([]);
      setIncomingMessages([]);
    }
  }, [isLoading, data]);

  return {
    allMessages,
    isLoading,
    handleSendMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
}
