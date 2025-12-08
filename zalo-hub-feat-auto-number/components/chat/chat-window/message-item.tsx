import React, { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageContent } from "./message-content";
import { MessageStatus } from "./message-status";
import { Message } from "@/lib/types/message";
import { MessageDropdownMenu } from "./message-dropdown-menu";
import { convertReactionsWithTopAndTotal } from "@/lib/utils/convertReactions";

interface MessageItemProps {
  message: any;
  conversationInfo: any;
  handleMessageAction: (action: string, messageId: string) => void;
  handleUndo: (message: Message, callback?: () => void) => void;
  formatTimeHHmm: (dateString: string) => string;
  accountIds: string[];
  openReactionsModal: (message: Message, accountIds: string[]) => void;
  onReply?: (message: Message) => void;
  onResend?: (message: Message) => void;
}

export function MessageItem({
  message,
  conversationInfo,
  accountIds,
  openReactionsModal,
  handleUndo,
  onReply,
  onResend,
}: MessageItemProps) {
  // Tính reactions summary
  const { top, total, hasReactions } = useMemo(() => {
    const result = convertReactionsWithTopAndTotal(message.reactions || []);
    return {
      ...result,
      hasReactions: result.top.length > 0,
    };
  }, [message.reactions]);

  return (
    <div
      className={`flex ${
        message.sender === "me" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-center max-w-xs lg:max-w-md group gap-1">
        {message.sender !== "me" && (
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={conversationInfo.friend?.avatar || "/placeholder.svg"}
            />
            <AvatarFallback>
              {conversationInfo.friend?.displayName?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`relative px-4 py-3 rounded-2xl max-w-full ${
            message.sender === "me"
              ? message.messageStatus === "failed"
                ? "bg-gray-100 text-gray-500 border border-gray-300"
                : message.source === "backend"
                ? "bg-blue-50 text-blue-800 border border-blue-200"
                : "bg-[#e6f0fd] text-[#1967d2]"
              : "bg-white text-gray-900 border border-gray-200"
          }`}
        >
          {message.msgType === "chat.sticker" ? (
            <img
              src={message.stickerUrl}
              style={{ width: 130, height: 130, display: "block" }}
              alt="sticker"
            />
          ) : message.msgType === "chat.gif" ? (
            (() => {
              // Parse params to get GIF URL
              let gifUrl = "";
              try {
                const params = message.params ? JSON.parse(message.params) : {};
                gifUrl = params.hd || params.small || "";
              } catch (e) {
                console.error("Error parsing GIF params:", e);
              }

              if (gifUrl) {
                return (
                  <img
                    src={gifUrl}
                    alt="GIF"
                    className="rounded-lg object-cover max-w-[280px] max-h-[320px]"
                    style={{ display: "block" }}
                  />
                );
              }
              return <span className="text-sm">GIF</span>;
            })()
          ) : (
            <MessageContent message={message} />
          )}

          <MessageDropdownMenu
            sender={message.sender}
            message={message}
            conversationInfo={conversationInfo}
            handleUndo={handleUndo}
            onReply={onReply}
            onResend={onResend}
          />

          {/* Reactions summary - chỉ hiển thị số lượng reactions */}
          {hasReactions && message.messageStatus !== "failed" && (
            <div
              className="absolute right-0 bottom-[-10px] z-[1]"
              onClick={() => openReactionsModal(message, accountIds)}
            >
              <div className="flex items-center px-2 py-1 rounded-xl border border-gray-200 bg-white space-x-1 cursor-pointer hover:bg-gray-50">
                {top.map((reaction, idx) => (
                  <span
                    key={idx}
                    className="text-xs"
                    style={{ fontSize: 13, lineHeight: 1 }}
                  >
                    {reaction.emoji}
                  </span>
                ))}
                <span
                  className="text-xs font-semibold text-gray-700"
                  style={{ fontSize: 12 }}
                >
                  {total}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              {message.msgType === "chat.sticker" ||
              message.msgType === "chat.gif"
                ? message.messageStatus === "failed" && (
                    <MessageStatus message={message} />
                  )
                : message.messageStatus && <MessageStatus message={message} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
