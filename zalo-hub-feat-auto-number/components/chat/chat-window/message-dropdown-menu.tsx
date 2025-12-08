import React from "react";
import { format } from "date-fns";
import { MessageCircle, Undo2, RotateCw, Info } from "lucide-react";
import { Message } from "@/lib/types/message";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type MessageDropdownMenuProps = {
  sender: string;
  message: any;
  conversationInfo?: any;
  handleUndo: (message: Message, callback?: () => void) => void;
  onReply?: (message: Message) => void;
  onResend?: (message: Message) => void;
};

export const MessageDropdownMenu = ({
  sender,
  message,
  conversationInfo,
  handleUndo,
  onReply,
  onResend,
}: MessageDropdownMenuProps) => {
  const handleReplyClick = () => {
    if (onReply) {
      onReply(message);
    }
  };

  const handleResendClick = () => {
    if (onResend) {
      onResend(message);
    }
  };

  // Format thời gian theo định dạng "HH:mm DD/MM"
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "HH:mm dd/MM");
  };

  // Lấy tên người gửi
  const getSenderName = () => {
    if (sender === "me") {
      return conversationInfo?.account?.displayName || "Tôi";
    }
    return (
      conversationInfo?.friend?.displayName ||
      conversationInfo?.friend?.username ||
      message?.senderName ||
      "Người dùng"
    );
  };

  const backendNoFail =
    message?.source === "backend" && message?.messageStatus !== "failed";

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={`absolute z-[5] bottom-1/2 translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
      ${sender === "me" ? "right-full mr-2" : "left-full ml-2"}
    `}
      >
        <div className="bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm border border-gray-200 pointer-events-auto relative">
          {/* Tên người gửi và thời gian */}
          <div className="flex flex-col gap-0.5 pr-6">
            <span className="text-xs text-gray-900 font-medium whitespace-nowrap">
              {getSenderName()}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(message.time || message.createdAt || message.ts)}
            </span>
          </div>

          {/* Chú thích khi message từ backend (socket không hoạt động) */}
          {sender === "me" &&
            message.source === "backend" &&
            message.messageStatus !== "failed" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute top-0.5 right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600 cursor-help shadow-sm">
                    <Info className="h-3 w-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="end"
                  className="text-xs leading-snug"
                >
                  <p>Tin nhắn gửi khi socket không hoạt động</p>
                </TooltipContent>
              </Tooltip>
            )}

          {/* Icon actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Reply icon - ẩn khi failed; nếu source=backend (không failed) thì disabled với mô tả */}
            {message.messageStatus !== "failed" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={backendNoFail ? undefined : handleReplyClick}
                disabled={backendNoFail}
                className={`h-7 w-7 ${
                  backendNoFail
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-100"
                }`}
                title={
                  backendNoFail
                    ? "Socket không hoạt động nên không thể trả lời tin nhắn"
                    : "Trả lời tin nhắn"
                }
                aria-label="Trả lời tin nhắn"
              >
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </Button>
            )}

            {/* Resend icon - hiển thị cho failed (khả dụng) hoặc sent+backend (disabled) */}
            {sender === "me" &&
              message.messageStatus === "failed" &&
              onResend &&
              message.isExpired !== 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleResendClick}
                  className={"h-7 w-7 hover:bg-orange-1000"}
                  title={"Gửi lại tin nhắn"}
                  aria-label="Gửi lại tin nhắn"
                >
                  <RotateCw className="w-4 h-4 text-orange-600" />
                </Button>
              )}

            {/* Hiển thị thông báo file đã hết hạn */}
            {sender === "me" &&
              message.messageStatus === "failed" &&
              message.isExpired === 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="absolute top-0 right-0 inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 cursor-help shadow-sm">
                      <Info className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="end"
                    className="text-xs leading-snug"
                  >
                    <p>File đã hết hạn</p>
                  </TooltipContent>
                </Tooltip>
              )}

            {/* Undo icon - ẩn khi failed; nếu source=backend (không failed) thì disabled với mô tả */}
            {sender === "me" && message.messageStatus !== "failed" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={backendNoFail ? undefined : () => handleUndo(message)}
                disabled={backendNoFail}
                className={`h-7 w-7 ${
                  backendNoFail
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-red-100"
                }`}
                title={
                  backendNoFail
                    ? "Kết nối trực tiếp tạm gián đoạn nên không thể thu hồi tin nhắn"
                    : "Thu hồi tin nhắn"
                }
                aria-label="Thu hồi tin nhắn"
              >
                <Undo2 className="w-4 h-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
