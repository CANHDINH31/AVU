import React, { useState, useMemo } from "react";
import { Message } from "@/lib/types/message";
import { MessageDropdownMenu } from "./message-dropdown-menu";
import { convertReactionsWithTopAndTotal } from "@/lib/utils/convertReactions";
import { MessageStatus } from "./message-status";

interface PhotoTitleItemProps {
  msg: any; // hoặc Message nếu chắc chắn
  isMe: boolean;
  conversationInfo?: any;
  formatTimeHHmm: (dateString: string) => string;
  accountIds: string[];
  openReactionsModal: (message: Message, accountIds: string[]) => void;
  handleUndo: (message: Message, callback?: () => void) => void;
  onReply?: (message: Message) => void;
  hideDropdownMenu?: boolean;
  hideReactions?: boolean;
}

export const PhotoTitleItem: React.FC<PhotoTitleItemProps> = ({
  msg,
  isMe,
  conversationInfo,
  formatTimeHHmm,
  accountIds,
  openReactionsModal,
  handleUndo,
  onReply,
  hideDropdownMenu = false,
  hideReactions = false,
}) => {
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  if (!msg.thumb) return null;

  // Tính reactions summary
  const { top, total, hasReactions } = useMemo(() => {
    const result = convertReactionsWithTopAndTotal(msg.reactions || []);
    return {
      ...result,
      hasReactions: result.top.length > 0,
    };
  }, [msg.reactions]);
  // Nếu chỉ có 1 ảnh thì cho to hơn
  const maxWidth = 320;
  const minWidth = 160;
  const maxHeight = 320;
  return (
    <>
      {!isImgLoaded && (
        <div
          className=" inset-0 flex items-center justify-center bg-gray-200 animate-pulse"
          style={{ height: maxHeight }}
        >
          <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div
        className={`flex flex-col items-center w-fit ${
          isMe ? "self-end" : "self-start"
        }`}
        style={{ maxWidth, minWidth }}
      >
        <div
          className={`relative rounded-2xl max-w-full ${
            isMe ? "bg-[#e6f0fd]" : "bg-white border border-gray-200"
          } group`}
        >
          <div
            className="w-full h-full overflow-hidden cursor-zoom-in bg-gray-100 rounded-t-2xl"
            style={{ aspectRatio: "1/1", maxHeight, position: "relative" }}
            onClick={() => setZoomedImg(msg.href)}
          >
            <img
              src={msg.thumb}
              alt={msg.title || "Ảnh"}
              className="w-full h-full object-cover"
              style={{
                aspectRatio: "1/1",
                maxHeight,
                display: isImgLoaded ? "block" : "none",
              }}
              onLoad={() => setIsImgLoaded(true)}
            />
            {(msg as any).isPlaceholder && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="flex items-center gap-2 text-white text-xs">
                  <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  <span>Đang tải ảnh...</span>
                </div>
              </div>
            )}
          </div>
          <div className="w-full px-4 py-2">
            <div className="text-[15px] break-words text-left leading-snug text-black">
              {msg.title}
            </div>
          </div>
          {!hideDropdownMenu && (
            <MessageDropdownMenu
              sender={msg.sender}
              message={msg}
              conversationInfo={conversationInfo}
              handleUndo={handleUndo}
              onReply={onReply}
            />
          )}

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
        {/* Trạng thái gửi cho ảnh */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <MessageStatus message={msg} />
          </div>
        </div>
      </div>
      {zoomedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setZoomedImg(null)}
          style={{ cursor: "zoom-out" }}
        >
          <img
            src={zoomedImg}
            alt="Ảnh phóng to"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
};
