import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageUndoProps {
  message: any;
  conversationInfo: any;
  formatTimeHHmm: (dateString: string) => string;
}

export function MessageUndo({
  message,
  conversationInfo,
  formatTimeHHmm,
}: MessageUndoProps) {
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
              ? "bg-[#e6f0fd]"
              : "bg-white border border-gray-200"
          } `}
        >
          <span className="text-sm italic text-gray-400 opacity-80 select-none">
            Tin nhắn đã được thu hồi
          </span>
        </div>
      </div>
    </div>
  );
}
