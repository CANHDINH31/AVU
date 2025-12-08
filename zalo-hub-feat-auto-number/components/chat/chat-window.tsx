"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { EmptyChatState } from "./empty-chat-state";
import { useRouter, useSearchParams } from "next/navigation";
import { useConversationById } from "@/hooks/use-conversations";
import { formatTimeHHmm } from "@/lib/utils";
import { ChatHeader } from "./chat-window/chat-header";
import { PinnedMessages } from "./chat-window/pinned-messages";
import { MessageList } from "./chat-window/message-list";
import { MessageInput } from "./chat-window/message-input";
import { NoMessagesPlaceholder } from "./no-messages-placeholder";
import { useChatMessages, Message } from "@/hooks/use-chat-messages";
import { Message as Msg } from "@/lib/types/message";
import { useReactions, useSendZaloReaction } from "@/hooks/use-reactions";
import MessageReactionsModal from "./chat-window/message-reactions-modal";
import { useMessageUndos, useUndoMessage } from "@/hooks/use-message-undos";

export function ChatWindow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("conversation");
  const [, forceUpdate] = useState({});

  const {
    data: conversationInfo,
    isLoading: isConversationLoading,
    refetch: refetchConversation,
  } = useConversationById(conversationId);

  // Listen for URL changes and force re-render
  useEffect(() => {
    const handlePopState = () => {
      forceUpdate({});
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Force re-render when router changes
  useEffect(() => {
    forceUpdate({});
  }, [router]);

  // UI state
  const [ui, setUI] = useState({
    newMessage: "",
    replyTo: null as Message | null,
    isRecording: false,
    showEmojiPicker: false,
    showSettings: false,
    showPinnedMessages: false,
    conversationSettings: {
      notifications: true,
      autoDownload: true,
      readReceipts: true,
      typing: true,
      theme: "default",
    },
  });

  // State quản lý modal reactions
  const [reactionsModal, setReactionsModal] = useState<{
    open: boolean;
    message: Msg | null;
    emojiSidebar: any[];
    filteredReactions: any[];
    selectedEmoji: string | null;
    reactionsByEmoji: Record<string, any[]>;
    accountIds: string[];
  }>({
    open: false,
    message: null,
    emojiSidebar: [],
    filteredReactions: [],
    selectedEmoji: null,
    reactionsByEmoji: {},
    accountIds: [],
  });

  // Hàm mở modal reactions
  const openReactionsModal = (message: Msg, accountIds: string[]) => {
    // Chuẩn bị reactionsByEmoji, emojiSidebar, filteredReactions

    const reactionsByEmoji: Record<string, any[]> = {};
    if (Array.isArray(message.reactions)) {
      for (const r of message.reactions) {
        if (!reactionsByEmoji[r.rIcon]) reactionsByEmoji[r.rIcon] = [];
        reactionsByEmoji[r.rIcon].push(r);
      }
    }
    const allEmojis = Object.keys(reactionsByEmoji);
    const emojiSidebar = [
      {
        icon: "all",
        label: "Tất cả",
        count: message.reactions?.length || 0,
        rIcon: "all",
      },
      ...allEmojis.map((icon) => ({
        icon,
        label: icon,
        count: reactionsByEmoji[icon]?.length || 0,
        rIcon: reactionsByEmoji[icon]?.[0]?.rIcon || icon,
      })),
    ];
    setReactionsModal({
      open: true,
      message,
      emojiSidebar,
      filteredReactions: message.reactions || [],
      selectedEmoji: null,
      reactionsByEmoji,
      accountIds,
    });
  };

  // Hàm đóng modal
  const closeReactionsModal = () => {
    setReactionsModal((prev) => ({ ...prev, open: false }));
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    allMessages,
    isLoading,
    handleSendMessage,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useChatMessages(conversationId, conversationInfo);

  // Placeholders media khi đang upload
  const [pendingPlaceholders, setPendingPlaceholders] = useState<Message[]>([]);
  const pendingObjectUrlsRef = useRef<string[]>([]);

  const prevMessageCountWhenLoadMore = useRef<number | null>(null);
  const prevMessageCount = useRef<number>(allMessages.length);

  useEffect(() => {
    // Nếu vừa load more (tức là số lượng tin nhắn tăng lên ở đầu), không scroll xuống cuối
    if (
      prevMessageCountWhenLoadMore.current !== null &&
      allMessages.length > prevMessageCountWhenLoadMore.current
    ) {
      prevMessageCountWhenLoadMore.current = null;
      prevMessageCount.current = allMessages.length;
      return;
    }

    // Nếu số lượng tin nhắn tăng lên (tức là có tin nhắn mới ở cuối)
    if (allMessages.length > prevMessageCount.current) {
      const lastMsg = allMessages[allMessages.length - 1];
      if (lastMsg && (lastMsg.sender === "me" || lastMsg.sender === "other")) {
        // Kiểm tra nếu là ảnh (placeholder hoặc ảnh thật), đợi một chút để ảnh render xong
        const isImageMessage =
          lastMsg.msgType === "chat.photo" ||
          (lastMsg as any).isPlaceholder ||
          pendingPlaceholders.length > 0;

        if (isImageMessage) {
          // Đợi DOM render xong rồi mới scroll
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            });
          });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
      // Khi có tin mới từ mình -> dọn placeholder
      if (
        lastMsg &&
        lastMsg.sender === "me" &&
        pendingPlaceholders.length > 0
      ) {
        setPendingPlaceholders([]);
        for (const url of pendingObjectUrlsRef.current) {
          try {
            URL.revokeObjectURL(url);
          } catch {}
        }
        pendingObjectUrlsRef.current = [];
      }
    }

    // Cập nhật lại số lượng tin nhắn trước đó
    prevMessageCount.current = allMessages.length;
  }, [allMessages]);

  const handleMessageAction = (action: string, messageId: string) => {
    // TODO: mutation API cho các action này
    switch (action) {
      case "reply":
        setUI((prev) => ({
          ...prev,
          replyTo: allMessages.find((m) => m.id === messageId) || null,
        }));
        textareaRef.current?.focus();
        break;
      case "forward":
        break;
      case "copy":
        {
          const msg = allMessages.find((m) => m.id === messageId);
          if (msg) navigator.clipboard.writeText(msg.content);
        }
        break;
      case "pin":
      case "recall":
      case "delete":
        break;
    }
  };

  const handleReply = (message: Message) => {
    setUI((prev) => ({
      ...prev,
      replyTo: message,
    }));

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 500); // hoặc 50ms
  };

  const handleCancelReply = () => {
    setUI((prev) => ({
      ...prev,
      replyTo: null,
    }));
  };

  useReactions(
    typeof conversationInfo?.account_id === "number"
      ? conversationInfo.account_id
      : -1,
    conversationId,
    () => {
      refetch();
    }
  );

  useMessageUndos(
    typeof conversationInfo?.account_id === "number"
      ? conversationInfo.account_id
      : -1,
    conversationId,
    () => {
      refetch();
    }
  );

  const { handleSendReaction } = useSendZaloReaction();
  const { handleUndoMessage } = useUndoMessage();

  const handleReaction = (
    message: Msg,
    emoji: string,
    callback?: () => void
  ) => {
    if (!conversationInfo?.account_id || !message) return;

    if (emoji === "") {
      handleSendReaction(message, conversationInfo.account_id, emoji);
      return;
    }

    if (emoji) {
      handleSendReaction(message, conversationInfo.account_id, emoji, {
        onSuccess: callback,
      });
    }
  };

  const handleUndo = (message: Msg, callback?: () => void) => {
    if (!conversationInfo?.account_id || !message) return;

    handleUndoMessage(message, conversationInfo.account_id, {
      onSuccess: callback,
    });
  };

  const handleResend = async (message: Msg) => {
    if (!message || message.messageStatus !== "failed") return;

    try {
      if (message.msgType === "chat.sticker") {
        // Resend sticker
        let stickerData: any = {
          stickerId: message.stickerId,
          cateId: message.cateId,
          type: message.stickerType,
          stickerUrl: message.stickerUrl,
          stickerSpriteUrl: message.stickerSpriteUrl,
          stickerWebpUrl: (message as any).stickerWebpUrl,
        };
        // Fallback: parse from contentJson nếu thiếu field
        if (
          (!stickerData.stickerId ||
            !stickerData.cateId ||
            !stickerData.type) &&
          message.contentJson
        ) {
          try {
            const parsed = JSON.parse(message.contentJson);
            stickerData = {
              stickerId: stickerData.stickerId ?? parsed?.id,
              cateId: stickerData.cateId ?? parsed?.cateId,
              type: stickerData.type ?? parsed?.type,
              stickerUrl: stickerData.stickerUrl ?? parsed?.stickerUrl,
              stickerSpriteUrl:
                stickerData.stickerSpriteUrl ?? parsed?.stickerSpriteUrl,
              stickerWebpUrl:
                stickerData.stickerWebpUrl ?? parsed?.stickerWebpUrl,
            };
          } catch {}
        }
        const payload = stickerData as any;
        await handleSendMessage(
          payload,
          () => {},
          () => {},
          "sticker"
        );
      } else if (
        message.msgType === "chat.photo" ||
        message.msgType === "share.file"
      ) {
        // Resend media/files using shared-folder flow
        const sharedItems: Array<{
          id: string;
          name: string;
          path: string;
          type: "file";
        }> = [];

        const appendItem = (path?: string, nameHint?: string) => {
          if (!path) return;
          const url = path.trim();
          if (!url) return;
          const segments = url.split("/");
          const fileNameFromPath = segments[segments.length - 1] || "file";
          const name = nameHint?.trim() || fileNameFromPath;
          sharedItems.push({
            id: `${message.id}-${sharedItems.length}`,
            name,
            path: url,
            type: "file",
          });
        };

        if (message.contentJson) {
          try {
            const parsed = JSON.parse(message.contentJson);
            const files = Array.isArray(parsed?.files) ? parsed.files : [];
            for (const file of files) {
              appendItem(
                file?.fileUrl ?? file?.path,
                file?.fileName ?? file?.title
              );
            }
          } catch (err) {
            console.warn("Không thể parse contentJson để resend:", err);
          }
        }

        if (sharedItems.length === 0) {
          appendItem(message.href, message.title || message.fileName);
        }

        if (sharedItems.length === 0) {
          console.warn("Không tìm thấy đường dẫn file để resend", message);
          return;
        }

        await handleSendMessage(
          sharedItems,
          () => {},
          () => {},
          "shared-folder"
        );
      } else {
        // Resend text
        const messageContent = message.content || "";
        if (!messageContent) return;
        await handleSendMessage(
          messageContent,
          () => {},
          () => {},
          undefined,
          undefined
        );
      }
    } catch (error) {
      console.error("Lỗi khi gửi lại tin nhắn:", error);
    }
  };

  const pinnedMessages: Message[] = [];

  if (!conversationInfo) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex-1 flex flex-col h-[90%] bg-white">
      <ChatHeader
        conversationInfo={conversationInfo}
        showSettings={ui.showSettings}
        setShowSettings={(show) =>
          setUI((prev) => ({ ...prev, showSettings: show }))
        }
        refetch={refetchConversation}
      />
      <PinnedMessages
        pinnedMessages={pinnedMessages}
        showPinnedMessages={ui.showPinnedMessages}
        setShowPinnedMessages={(show) =>
          setUI((prev) => ({ ...prev, showPinnedMessages: show }))
        }
        handleMessageAction={handleMessageAction}
      />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {isLoading || isConversationLoading ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-sm text-gray-600">Đang tải...</span>
          </div>
        ) : allMessages.length === 0 ? (
          <NoMessagesPlaceholder />
        ) : (
          <MessageList
            messages={[...allMessages, ...pendingPlaceholders]}
            conversationInfo={conversationInfo}
            handleMessageAction={handleMessageAction}
            handleUndo={handleUndo}
            formatTimeHHmm={formatTimeHHmm}
            messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
            fetchNextPage={async () => {
              prevMessageCountWhenLoadMore.current = allMessages.length;
              await fetchNextPage();
            }}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            accountIds={[conversationInfo.account_id?.toString() || ""]}
            openReactionsModal={openReactionsModal}
            onReply={handleReply}
            onResend={handleResend}
          />
        )}
      </div>
      <div className="p-4 border-t flex-shrink-0 bg-white border-gray-200">
        <MessageInput
          onSendMessage={async (msg, type) => {
            // Tạo placeholder cho shared folder items trước khi gửi
            if (type === "shared-folder") {
              const items: any[] = Array.isArray(msg) ? msg : [];
              const now = Date.now();
              const placeholders: Message[] = [];

              items.forEach((item, idx) => {
                if (item.type === "file" && item.path) {
                  // Kiểm tra xem có phải ảnh không
                  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
                    item.name || ""
                  );

                  if (isImage) {
                    placeholders.push({
                      id: `pending-shared-img-${now}-${idx}`,
                      sender: "me",
                      content: "",
                      time: new Date().toISOString(),
                      msgType: "chat.photo",
                      href: item.path,
                      thumb: item.path,
                      messageStatus: "sending",
                      isPlaceholder: true as any,
                    } as any);
                  } else {
                    placeholders.push({
                      id: `pending-shared-file-${now}-${idx}`,
                      sender: "me",
                      content: `Đang tải ${item.name || "tệp"}...`,
                      time: new Date().toISOString(),
                      type: "text",
                      messageStatus: "sending",
                      isPlaceholder: true as any,
                    } as any);
                  }
                }
              });

              if (placeholders.length > 0) {
                setPendingPlaceholders(placeholders);

                // Scroll đến cuối khi thêm placeholder
                const hasImages = placeholders.some(
                  (p) => p.msgType === "chat.photo"
                );
                if (hasImages) {
                  // Đợi DOM render xong rồi mới scroll
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      setTimeout(() => {
                        messagesEndRef.current?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }, 100);
                    });
                  });
                }
              }
            }

            try {
              await handleSendMessage(
                msg,
                () => setUI((prev) => ({ ...prev, newMessage: "" })),
                () => setUI((prev) => ({ ...prev, replyTo: null })),
                type,
                ui.replyTo ?? undefined
              );
            } catch (error: any) {
              // Xử lý lỗi khi gửi ảnh/file/shared folder
              if (
                type === "attachments" ||
                type === "video" ||
                type === "shared-folder"
              ) {
                setPendingPlaceholders((prev) =>
                  prev.map((placeholder) => ({
                    ...placeholder,
                    messageStatus: "failed" as const,
                    isPlaceholder: true as any,
                  }))
                );
                try {
                  await refetch();
                } finally {
                  setPendingPlaceholders([]);
                }
              }
              console.error("Lỗi khi gửi tin nhắn:", error);
            }
          }}
          onAddPending={(files: File[], kind: "attachments" | "video") => {
            const now = Date.now();
            const placeholders: Message[] = [];
            files.forEach((file, idx) => {
              if (file.type.startsWith("image/")) {
                const url = URL.createObjectURL(file);
                pendingObjectUrlsRef.current.push(url);
                placeholders.push({
                  id: `pending-img-${now}-${idx}`,
                  sender: "me",
                  content: "",
                  time: new Date().toISOString(),
                  msgType: "chat.photo",
                  href: url,
                  thumb: url,
                  messageStatus: "sending",
                  isPlaceholder: true as any,
                } as any);
              } else if (kind === "video" || file.type.startsWith("video/")) {
                placeholders.push({
                  id: `pending-video-${now}-${idx}`,
                  sender: "me",
                  content: "Đang tải video...",
                  time: new Date().toISOString(),
                  type: "text",
                  messageStatus: "sending",
                  isPlaceholder: true as any,
                } as any);
              } else {
                placeholders.push({
                  id: `pending-file-${now}-${idx}`,
                  sender: "me",
                  content: `Đang tải tệp...`,
                  time: new Date().toISOString(),
                  type: "text",
                  messageStatus: "sending",
                  isPlaceholder: true as any,
                } as any);
              }
            });
            setPendingPlaceholders(placeholders);

            // Scroll đến cuối khi thêm placeholder ảnh
            if (
              placeholders.length > 0 &&
              placeholders.some((p) => p.msgType === "chat.photo")
            ) {
              // Đợi DOM render xong rồi mới scroll
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                });
              });
            }
          }}
          accountId={conversationInfo.account_id}
          conversationId={conversationId}
          replyToMessage={ui.replyTo}
          onCancelReply={handleCancelReply}
          textareaRef={textareaRef}
        />
      </div>
      {/* Modal reactions detail ngoài cùng */}
      <MessageReactionsModal
        open={reactionsModal.open}
        onClose={closeReactionsModal}
        emojiSidebar={reactionsModal.emojiSidebar}
        filteredReactions={
          reactionsModal.selectedEmoji
            ? reactionsModal.reactionsByEmoji[reactionsModal.selectedEmoji] ||
              []
            : reactionsModal.filteredReactions
        }
        selectedEmoji={reactionsModal.selectedEmoji}
        setSelectedEmoji={(emoji) =>
          setReactionsModal((prev) => ({ ...prev, selectedEmoji: emoji }))
        }
        accountIds={reactionsModal.accountIds}
      />
    </div>
  );
}
