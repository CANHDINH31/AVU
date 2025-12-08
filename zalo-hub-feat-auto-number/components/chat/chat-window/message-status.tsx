import React from "react";
import { Clock, Check, X } from "lucide-react";

interface MessageStatusProps {
  message: any;
}

export const MessageStatus = React.memo(function MessageStatus({
  message,
}: MessageStatusProps) {
  if (message.sender !== "me" || !message.messageStatus) return null;

  switch (message.messageStatus) {
    case "sending":
      return (
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-gray-600 animate-pulse" />
          <span className="text-xs text-gray-600">Đang gửi...</span>
        </div>
      );
    case "sent":
      return (
        <div className="flex items-center space-x-1">
          <Check className="w-3 h-3 text-gray-600" />
          <span className="text-xs text-gray-600">Đã gửi</span>
        </div>
      );
    case "failed":
      return (
        <div className="flex items-center space-x-1 px-2 py-1 bg-red-50 border border-red-200 rounded-md">
          <X className="w-3 h-3 text-red-500" />
          <span className="text-xs text-red-600 font-medium">Gửi thất bại</span>
        </div>
      );
    default:
      return null;
  }
});
