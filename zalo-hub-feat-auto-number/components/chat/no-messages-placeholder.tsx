import { MessageCircle } from "lucide-react";
import React from "react";

export function NoMessagesPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="flex flex-col items-center justify-center p-10 bg-white/80 dark:bg-gray-900/80 rounded-3xl shadow-xl border border-blue-100 dark:border-gray-700">
        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 shadow mb-6">
          <MessageCircle className="w-14 h-14 text-blue-500 dark:text-blue-300" />
        </div>
        <span className="text-2xl font-bold text-blue-500 dark:text-blue-300 mb-2">
          Chưa có tin nhắn nào
        </span>
        <span className="text-base text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện với bạn bè của
          bạn trên Zalo!
        </span>
      </div>
    </div>
  );
}
