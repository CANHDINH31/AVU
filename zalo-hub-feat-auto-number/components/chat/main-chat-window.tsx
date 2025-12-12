"use client";

import { MessageCircle } from "lucide-react";
import { ChatWindow } from "./chat-window";

interface MainChatWindowProps {
  accounts: string[];
  disconnectedAccounts: any[];
}

export function MainChatWindow({
  accounts,
  disconnectedAccounts,
}: MainChatWindowProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b h-[10%]  bg-white border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">QĐ Zalo</h1>
            <p className="text-sm text-gray-500">
              {accounts.length} tài khoản đang hoạt động
              {disconnectedAccounts.length > 0 && (
                <span className="text-yellow-600 ml-1">
                  ({disconnectedAccounts.length} mất kết nối)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <ChatWindow />
    </div>
  );
}
