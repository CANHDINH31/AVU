import React, { useMemo } from "react";
import { Message } from "@/lib/types/message";
import { PhotoThumb } from "./photo-thumb";
import { convertReactionsWithTopAndTotal } from "@/lib/utils/convertReactions";
import { MessageStatus } from "./message-status";

interface PhotoNoTitleItemProps {
  msg: Message;
  accountIds: string[];
  openReactionsModal: (message: Message, accountIds: string[]) => void;
  onHover?: (message: Message) => void;
  thumbSize?: number;
  hideReactions?: boolean;
}

export const PhotoNoTitleItem: React.FC<PhotoNoTitleItemProps> = ({
  msg,
  accountIds,
  openReactionsModal,
  onHover,
  thumbSize = 160,
  hideReactions = false,
}) => {
  if (!msg.thumb) return null;

  // Tính reactions summary
  const { top, total, hasReactions } = useMemo(() => {
    const result = convertReactionsWithTopAndTotal(msg.reactions || []);
    return {
      ...result,
      hasReactions: result.top.length > 0,
    };
  }, [msg.reactions]);

  const handleHover = () => {
    onHover?.(msg);
  };

  return (
    <div
      key={msg.id}
      className="relative flex flex-col items-center"
      onMouseEnter={handleHover}
      onFocus={handleHover}
    >
      <div
        className="w-full max-w-[180px] relative"
        style={{ minWidth: thumbSize, maxWidth: thumbSize }}
      >
        <PhotoThumb url={msg.href} size={thumbSize} />
        {(msg as any).isPlaceholder && msg.messageStatus === "sending" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
            <div className="flex items-center gap-2 text-white text-xs">
              <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải ảnh...</span>
            </div>
          </div>
        )}
        {(msg as any).isPlaceholder && msg.messageStatus === "failed" && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center rounded-md">
            <div className="flex flex-col items-center gap-2 text-red-600 text-xs">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Gửi ảnh thất bại</span>
              <span className="text-[10px] text-center px-2">
                Vui lòng thử lại
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trạng thái gửi cho ảnh không tiêu đề */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          <MessageStatus message={msg} />
        </div>
      </div>

      {/* Reactions summary - chỉ hiển thị số lượng reactions */}
      {!hideReactions && hasReactions && (
        <div
          className="absolute right-0 bottom-[-10px] z-[10]"
          onClick={() => openReactionsModal(msg, accountIds)}
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
    </div>
  );
};
