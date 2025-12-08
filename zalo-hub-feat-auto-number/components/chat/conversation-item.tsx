"use client";

import React, { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Pin } from "lucide-react";
import { Conversation } from "@/lib/types/conversation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { formatTimeHHmm } from "@/lib/utils";
import { useTogglePinConversation } from "@/hooks/use-conversations";
import { toast } from "sonner";
import { zaloApi } from "@/lib/api";
import { iconToEmoji } from "@/lib/utils/convertReactions";
import { LastMessageContent } from "./last-message-content";
import { Badge } from "../ui/badge";

// Hàm sinh màu pastel từ chuỗi (displayName hoặc id) - màu pastel nhẹ nhàng
function getAccountColor(str: string | number) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 75%)`;
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPinToggle?: () => void;
}

export const ConversationItem = React.memo(
  ({
    conversation,
    isSelected,
    onSelect,
    onPinToggle,
  }: ConversationItemProps) => {
    const { mutateAsync } = useTogglePinConversation();

    const handleClick = useCallback(() => {
      onSelect(conversation.id.toString());
    }, [conversation.id, onSelect]);

    const handlePinToggle = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
          if (
            conversation.isPinned === 0 &&
            conversation.messages.length === 0
          ) {
            toast.error("Hội thoại không có tin nhắn.");
            return;
          }
          const updated = await mutateAsync(conversation.id);

          await zaloApi.pinConversation({
            accountId: conversation.account_id,
            threadId: conversation.messages?.[0].threadId as string,
            isPinned: updated.isPinned || 0,
          });

          onPinToggle?.();
          toast(
            updated.isPinned === 1
              ? "Đã ghim hội thoại lên đầu danh sách."
              : "Đã bỏ ghim hội thoại."
          );
        } catch (error: any) {
          toast.error(
            error?.message || "Không thể thực hiện thao tác ghim/bỏ ghim."
          );
        }
      },
      [conversation.id, onPinToggle, mutateAsync]
    );

    const displayName = useMemo(() => {
      return (
        conversation.friend.displayName ||
        conversation.friend.username ||
        conversation.friend.zaloName ||
        `Friend ${conversation.friend.id}`
      );
    }, [conversation.friend]);

    const accountColor = useMemo(() => {
      return getAccountColor(
        conversation.account?.displayName || conversation.account?.username || 0
      );
    }, [conversation.account]);

    const accountInitial = useMemo(() => {
      const name =
        conversation.account?.displayName ||
        conversation.account?.username ||
        "U";
      // Lấy chữ cái đầu tiên, chuyển thành chữ hoa
      return name.charAt(0).toUpperCase();
    }, [conversation.account]);

    const lastMessage = conversation.messages?.[0]?.content;
    const lastMessageTime = conversation.messages?.[0]?.createdAt;
    const isSeft = conversation.messages?.[0]?.isSelf === 1;
    const isStranger = conversation.friend.isFr == 0;

    return (
      <div
        className={`relative flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b transition-colors group ${
          isSelected
            ? "bg-blue-50 border-l-4 border-l-blue-500"
            : "border-gray-100"
        }`}
        onClick={handleClick}
      >
        <div className="relative mr-3 flex-shrink-0">
          {/* Avatar với CSS thuần */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            <img
              src={conversation.friend.avatar || "/placeholder.svg"}
              alt={displayName}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>
          {conversation.friend.isActive === 1 && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="min-w-0  flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-medium text-sm text-gray-900 truncate min-w-0 flex-1">
                    {displayName}
                  </h3>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-white text-gray-900 text-xs px-3 py-2 border border-gray-200 rounded shadow-sm"
                >
                  <div>{displayName}</div>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 h-5 font-medium cursor-pointer hover:opacity-80 transition-opacity inline-block truncate flex-shrink-0"
                    style={{
                      backgroundColor: accountColor,
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      maxWidth: "120px",
                    }}
                  >
                    {accountInitial}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-white text-gray-900 text-xs px-3 py-2 border border-gray-200 rounded shadow-sm"
                >
                  <div className="space-y-1">
                    <div>{conversation.account?.displayName}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
              {/* Unread count cạnh accountInitial */}
              {(conversation?.unreadCount ?? 0) > 0 && (
                <span
                  className="bg-red-500 text-white text-[11px] rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white px-2 h-5 min-w-[20px] flex-shrink-0"
                  style={{
                    boxShadow: "0 2px 8px rgba(220,38,38,0.15)",
                    letterSpacing: 0.5,
                  }}
                >
                  {(conversation.unreadCount ?? 0) > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Icon pin - luôn hiển thị khi pinned, chỉ hiển thị khi hover nếu chưa pinned */}
              {conversation.isPinned === 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                  tabIndex={-1}
                  onClick={handlePinToggle}
                  title="Ghim hội thoại"
                >
                  <Pin className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-1 h-6 w-6"
                  tabIndex={-1}
                  onClick={handlePinToggle}
                  title="Bỏ ghim hội thoại"
                >
                  <Pin className="w-4 h-4 text-blue-500 fill-blue-500" />
                </Button>
              )}
            </div>
          </div>
          {/* Tin nhắn cuối cùng hoặc thông báo chưa có tin nhắn */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span
                className={`text-xs truncate text-gray-700 ${
                  lastMessage ? "font-medium" : "italic"
                }`}
                style={{ maxWidth: "60%" }}
              >
                <LastMessageContent
                  lastMessage={lastMessage}
                  isSeft={isSeft}
                  conversation={conversation}
                />
              </span>
              {/* Hiển thị icon reaction chưa đọc nếu có */}
              {conversation.latestUnreadReaction?.rIcon && (
                <span
                  className="text-sm flex-shrink-0"
                  title="Có reaction chưa đọc"
                >
                  {iconToEmoji[conversation.latestUnreadReaction.rIcon] ||
                    conversation.latestUnreadReaction.rIcon}
                </span>
              )}
            </div>
            {lastMessageTime && (
              <span
                className="ml-2 text-xs text-gray-500 whitespace-nowrap flex-shrink-0"
                title={lastMessageTime}
              >
                {formatTimeHHmm(lastMessageTime)}
              </span>
            )}
          </div>

          {/* Hiển thị badge người lạ */}
          {isStranger && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[11px] font-semibold border border-blue-200 whitespace-nowrap">
                Người lạ
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ConversationItem.displayName = "ConversationItem";
