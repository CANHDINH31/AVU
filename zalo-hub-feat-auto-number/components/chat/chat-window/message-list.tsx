import type React from "react";
import { useRef, useEffect } from "react";
import { LoadingIndicator } from "./loading-indicator";
import { MessageItem } from "./message-item";
import { Message } from "@/lib/types/message";
import { PhotoGroup } from "./photo-group";
import { StickerGroup } from "./sticker-group";
import { VideoMessage } from "./video-message";
import { MessageUndo } from "./message-undo";
import { CallMessage } from "./call-message";
import { EcardMessage } from "./ecard-message";

export function MessageList({
  messages,
  conversationInfo,
  handleMessageAction,
  handleUndo,
  formatTimeHHmm,
  messagesEndRef,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  accountIds,
  openReactionsModal,
  onReply,
  onResend,
}: {
  messages: any[];
  conversationInfo: any;
  handleMessageAction: (action: string, messageId: string) => void;
  handleUndo: (message: Message, callback?: () => void) => void;
  formatTimeHHmm: (dateString: string) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  fetchNextPage?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  accountIds: string[];
  openReactionsModal: (message: Message, accountIds: string[]) => void;
  onReply?: (message: Message) => void;
  onResend?: (message: Message) => void;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!fetchNextPage || !hasNextPage) return;

    //đảm bảo component đã ổn định
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 2000);

    const handleScroll = (e: any) => {
      const container = e.target;

      if (
        container.scrollTop < 20 &&
        hasNextPage &&
        !isFetchingNextPage &&
        !isInitialLoad.current
      ) {
        fetchNextPage();
      }
    };

    const parent = topRef.current?.parentElement;
    if (parent) {
      parent.addEventListener("scroll", handleScroll);
    }

    return () => {
      clearTimeout(timer);
      if (parent) {
        parent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Gom sticker/photo liên tục cùng sender thành group, còn lại giữ nguyên
  function groupMessagesByTypeAndSender(messages: any[]): any[] {
    const result: any[] = [];
    let buffer: any[] = [];
    let bufferType: string | null = null;
    let bufferSender: string | null = null;

    function flushBuffer() {
      if (buffer.length === 0) return;
      if (bufferType === "chat.sticker") {
        // Group sticker liên tục theo cặp
        for (let i = 0; i < buffer.length; i += 2) {
          const group = buffer.slice(i, i + 2);
          result.push({
            type: "sticker-group",
            sender: bufferSender,
            stickers: group,
          });
        }
      } else if (bufferType === "chat.photo") {
        // Group photo liên tục theo cặp
        for (let i = 0; i < buffer.length; i += 2) {
          const group = buffer.slice(i, i + 2);
          result.push({
            type: "photo-group",
            sender: bufferSender,
            photos: group,
          });
        }
      } else {
        // Đẩy từng tin nhắn lẻ ra
        for (const msg of buffer) result.push(msg);
      }
      buffer = [];
      bufferType = null;
      bufferSender = null;
    }

    for (const msg of messages) {
      const isMedia =
        msg.msgType === "chat.sticker" || msg.msgType === "chat.photo";
      if (isMedia && msg.undo !== 1) {
        // Nếu run khác type/sender -> flush trước khi xét tiếp
        if (
          buffer.length > 0 &&
          (msg.msgType !== bufferType || msg.sender !== bufferSender)
        ) {
          flushBuffer();
        }

        // Ảnh có title tách riêng
        if (msg.msgType === "chat.photo" && msg.title) {
          flushBuffer();
          result.push({
            type: "photo-group",
            sender: msg.sender,
            photos: [msg],
          });
          continue;
        }

        // Nếu failed: flush nhóm trước, failed đứng riêng, rồi tiếp tục run
        if (msg.messageStatus === "failed") {
          flushBuffer();
          result.push(msg);
          // reset run markers để tiếp tục nhóm bình thường sau failed
          bufferType = null;
          bufferSender = null;
          continue;
        }

        // Mặc định: push vào buffer để nhóm theo cặp
        buffer.push(msg);
        bufferType = msg.msgType;
        bufferSender = msg.sender;
      } else {
        // Không phải sticker/photo: flush nhóm trước và đẩy item thường
        flushBuffer();
        result.push(msg);
      }
    }
    flushBuffer();
    return result;
  }

  // Generate unique key for each group/item
  function getUniqueKey(group: any, index: number): string {
    if (group.undo === 1) {
      return `undo-${group.id}-${index}`;
    }
    if (group.type === "sticker-group") {
      const ids = group.stickers.map((m: any) => m.id).join("-");
      return `sticker-group-${ids}-${index}`;
    }
    if (group.type === "photo-group") {
      const ids = group.photos.map((m: any) => m.id).join("-");
      return `photo-group-${ids}-${index}`;
    }
    // For regular messages, use ID with index to ensure uniqueness
    // Also include msgType to differentiate between different message types with same ID
    return `msg-${group.id}-${group.msgType || "default"}-${index}`;
  }

  // Deduplicate messages by ID, keeping the last occurrence
  // This prevents duplicate key errors while maintaining data integrity
  function deduplicateMessages(messages: any[]): any[] {
    const seenIds = new Set<number | string>();
    const result: any[] = [];
    let duplicateCount = 0;

    // Process in reverse to keep last occurrence of duplicates
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.id !== undefined && msg.id !== null) {
        if (!seenIds.has(msg.id)) {
          result.unshift(msg);
          seenIds.add(msg.id);
        } else {
          duplicateCount++;
        }
      } else {
        // Messages without ID are kept as-is (pending messages might not have IDs)
        result.unshift(msg);
      }
    }

    // Log warning in development if duplicates were found
    if (process.env.NODE_ENV === "development" && duplicateCount > 0) {
      console.warn(
        `Found ${duplicateCount} duplicate message(s) in MessageList`
      );
    }

    return result;
  }

  // Deduplicate before grouping to prevent duplicate keys
  const deduplicatedMessages = deduplicateMessages(messages);
  const groupedMessages = groupMessagesByTypeAndSender(deduplicatedMessages);

  return (
    <div className="max-w-4xl mx-auto space-y-4  max-h-full">
      <div ref={topRef} />
      <LoadingIndicator isFetchingNextPage={isFetchingNextPage || false} />
      {groupedMessages.map((group, index) => {
        const uniqueKey = getUniqueKey(group, index);

        if (group.undo === 1) {
          return (
            <MessageUndo
              key={uniqueKey}
              message={group}
              conversationInfo={conversationInfo}
              formatTimeHHmm={formatTimeHHmm}
            />
          );
        }

        if (group.type === "sticker-group") {
          return (
            <StickerGroup
              key={uniqueKey}
              group={group}
              conversationInfo={conversationInfo}
              handleUndo={handleUndo}
              onReply={onReply}
            />
          );
        }

        if (group.type === "photo-group") {
          return (
            <PhotoGroup
              key={uniqueKey}
              group={group}
              conversationInfo={conversationInfo}
              formatTimeHHmm={formatTimeHHmm}
              accountIds={accountIds}
              openReactionsModal={openReactionsModal}
              handleUndo={handleUndo}
              onReply={onReply}
            />
          );
        }

        if (group.msgType === "chat.video.msg") {
          return (
            <div key={uniqueKey} id={`message-${group.id}`}>
              <VideoMessage
                message={group}
                conversationInfo={conversationInfo}
                handleMessageAction={handleMessageAction}
                accountIds={accountIds}
                openReactionsModal={openReactionsModal}
                formatTimeHHmm={formatTimeHHmm}
                handleUndo={handleUndo}
                onReply={onReply}
              />
            </div>
          );
        }

        if (
          group.msgType === "chat.recommended" &&
          (group.action === "recommened.misscall" ||
            group.action === "recommened.calltime")
        ) {
          return (
            <div key={uniqueKey} id={`message-${group.id}`}>
              <CallMessage
                message={group}
                conversationInfo={conversationInfo}
                formatTimeHHmm={formatTimeHHmm}
              />
            </div>
          );
        }

        if (group.msgType === "chat.ecard" && group.action === "show.profile") {
          return (
            <div key={uniqueKey} id={`message-${group.id}`}>
              <EcardMessage
                message={group}
                conversationInfo={conversationInfo}
              />
            </div>
          );
        }

        return (
          <div key={uniqueKey} id={`message-${group.id}`}>
            <MessageItem
              message={group}
              conversationInfo={conversationInfo}
              handleMessageAction={handleMessageAction}
              handleUndo={handleUndo}
              formatTimeHHmm={formatTimeHHmm}
              accountIds={accountIds}
              openReactionsModal={openReactionsModal}
              onReply={onReply}
              onResend={onResend}
            />
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
