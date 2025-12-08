import React, { useState, useRef, useEffect } from "react";
import {
  quickReactions,
  convertReactionsWithTopAndTotal,
} from "@/lib/utils/convertReactions";
import { burstEmojiAt } from "@/lib/utils/confetti";
import { Message } from "@/lib/types/message";

interface PhotoReactionButtonProps {
  message: any;
  handleReaction: (
    message: Message,
    emoji: string,
    callback?: () => void
  ) => void;
  accountIds: string[];
  hasReactions?: boolean;
  openReactionsModal: (message: Message, accountIds: string[]) => void;
}

export const PhotoReactionButton: React.FC<PhotoReactionButtonProps> = ({
  message,
  handleReaction,
  accountIds,
  hasReactions = true,
  openReactionsModal,
}) => {
  if (!hasReactions) return null;
  const [showReactions, setShowReactions] = useState(false);
  // const [showModal, setShowModal] = useState(false); // bỏ state modal nội bộ
  const btnRef = useRef<HTMLButtonElement>(null);
  const reactionBoxRef = useRef<HTMLDivElement>(null);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        reactionBoxRef.current &&
        !reactionBoxRef.current.contains(event.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(event.target as Node)
      ) {
        setShowReactions(false);
      }
    }
    if (showReactions) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showReactions]);

  // Tổng hợp reaction
  const { top, total } = convertReactionsWithTopAndTotal(
    message.reactions || []
  );

  // Group reactions by emoji (for modal)
  const reactionsByEmoji: Record<string, any[]> = {};
  if (Array.isArray(message.reactions)) {
    for (const r of message.reactions) {
      if (!reactionsByEmoji[r.rIcon]) reactionsByEmoji[r.rIcon] = [];
      reactionsByEmoji[r.rIcon].push(r);
    }
  }

  return (
    <>
      <div className="relative flex items-center gap-2">
        {top.length > 0 && (
          <span
            className="flex items-center gap-1 px-1 py-0 bg-white rounded-full shadow border border-gray-200 text-sm cursor-pointer"
            onClick={() => openReactionsModal(message, accountIds)}
          >
            {top.map((reaction, idx) => (
              <span key={idx} className="text-sm">
                {reaction.emoji}
              </span>
            ))}
            {total > 0 && (
              <span className="ml-0 font-semibold text-gray-700 text-xs">
                {total}
              </span>
            )}
          </span>
        )}
        <div className="relative inline-block">
          <button
            ref={btnRef}
            className="text-sm bg-white rounded-full shadow px-1.5 py-0.5 hover:scale-110 transition"
            aria-label="Thả cảm xúc"
            type="button"
            tabIndex={0}
            onClick={() => setShowReactions(true)}
          >
            😊
          </button>
          {showReactions && (
            <div
              ref={reactionBoxRef}
              className="absolute bottom-8 right-0 flex items-center gap-1 px-1 py-0 rounded-full z-[60] bg-white border border-gray-200 shadow-lg reaction-popup"
              style={{ minHeight: 28 }}
            >
              <style>{`
                .reaction-popup::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  border-radius: 9999px;
                  background: rgba(0,0,0,0.08);
                  z-index: 0;
                }
              `}</style>
              {quickReactions.map((emoji) => {
                const handleClick = () => {
                  handleReaction(message, emoji.text, () => {
                    if (btnRef.current) {
                      const rect = btnRef.current.getBoundingClientRect();
                      burstEmojiAt(
                        rect.left + rect.width / 2,
                        rect.top + rect.height / 2,
                        emoji.icon
                      );
                    }
                  });
                  setShowReactions(false);
                };
                return (
                  <button
                    key={emoji.text}
                    onClick={handleClick}
                    className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-base transition-transform duration-150 hover:scale-125 relative z-10"
                    type="button"
                  >
                    {emoji.icon}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  handleReaction(message, "");
                  setShowReactions(false);
                }}
                className="w-5 h-5 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-700 rounded-full text-base ml-0.5 transition-transform duration-150 hover:scale-125 relative z-10"
                title="Xóa tất cả reaction"
                type="button"
              >
                ❌
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
