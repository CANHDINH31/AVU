import React, { useMemo, useState } from "react";
import {
  convertReactionsWithTopAndTotal,
  quickReactions,
} from "../../../lib/utils/convertReactions";
import { Message } from "@/lib/types/message";
import { burstEmojiAt } from "@/lib/utils/confetti";

interface MessageReactionsProps {
  message: any;
  handleReaction: (
    message: Message,
    emoji: string,
    callback?: () => void
  ) => void;
  accountIds: string[];
  openReactionsModal: (message: Message, accountIds: string[]) => void;
  userZaloId: string;
}

export const MessageReactions = React.memo(function MessageReactions({
  message,
  handleReaction,
  accountIds,
  openReactionsModal,
  userZaloId,
}: MessageReactionsProps) {
  const handleQuickReaction = (
    emoji: { text: string; icon: string },
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    handleReaction(message, emoji.text, () => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      burstEmojiAt(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        emoji.icon
      );
    });
  };

  // Thêm state hover
  const [isHovered, setIsHovered] = useState(false);

  // Tính userLastReaction bằng useMemo để tối ưu hiệu năng
  const userLastReaction = useMemo(() => {
    const lastReactionText =
      message.reactions?.slice(-1)[0]?.rIcon || "/-strong";
    return (
      quickReactions?.find((q) => q.text === lastReactionText) ||
      quickReactions[0]
    );
  }, [message.reactions]);

  const { top, total, hasReactions } = useMemo(() => {
    const result = convertReactionsWithTopAndTotal(message.reactions || []);
    return {
      ...result,
      hasReactions: result.top.length > 0,
    };
  }, [message.reactions]);

  const hasButtonClearReactions = useMemo(() => {
    return (message.reactions || []).some((r: any) => r.uidFrom === userZaloId);
  }, [message.reactions, userZaloId]);

  return (
    <div className="flex items-center space-x-0.5">
      {/* Reactions summary */}
      {hasReactions && (
        <div
          className="flex items-center px-2 py-1 rounded-xl border border-gray-200 bg-white space-x-1 cursor-pointer"
          onClick={() => openReactionsModal(message, accountIds)}
        >
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
      )}

      {/* Reaction của bạn + popup */}
      <div className="inline-block">
        {/* Reaction của bạn */}
        <div
          className={`flex items-center px-2 py-1 rounded-xl border border-gray-200 bg-white cursor-pointer transition-opacity ${
            hasReactions ? "" : "opacity-0 group-hover:opacity-100"
          }`}
          title="Reaction của bạn"
        >
          <div
            className="relative text-xs"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <button onClick={(e) => handleQuickReaction(userLastReaction, e)}>
              {userLastReaction.icon}
            </button>
            {/* Quick reactions popup */}
            <div
              className="absolute bottom-[100%] right-0 flex space-x-1 p-1 rounded-full z-10 bg-white border border-gray-200 shadow-lg transition-opacity quick-reactions-popup"
              style={{
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? "auto" : "none",
              }}
            >
              {quickReactions.map((emoji) => (
                <button
                  key={emoji.text}
                  onClick={(e) => handleQuickReaction(emoji, e)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-sm transition-transform duration-150 hover:scale-125"
                >
                  {emoji.icon}
                </button>
              ))}
              {hasButtonClearReactions && (
                <button
                  onClick={() => handleReaction(message, "")}
                  className="w-6 h-6 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-700 rounded-full text-base ml-1"
                  title="Xóa tất cả reaction"
                >
                  ❌
                </button>
              )}
            </div>

            <div
              className="absolute"
              style={{
                bottom: 12,
                right: 0,
                width: "50px",
                height: "10px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});
