import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message } from "@/lib/types/message";
import { MessageDropdownMenu } from "./message-dropdown-menu";
import { convertReactionsWithTopAndTotal } from "@/lib/utils/convertReactions";

interface VideoMessageProps {
  message: any;
  conversationInfo: any;
  handleMessageAction: (action: string, messageId: string) => void;
  accountIds: string[];
  openReactionsModal: (message: Message, accountIds: string[]) => void;
  formatTimeHHmm: (dateString: string) => string;
  handleUndo: (message: Message, callback?: () => void) => void;
  onReply?: (message: Message) => void;
}

export const VideoMessage: React.FC<VideoMessageProps> = ({
  message,
  conversationInfo,
  accountIds,
  openReactionsModal,
  formatTimeHHmm,
  handleUndo,
  onReply,
}) => {
  const [open, setOpen] = useState(false);

  // Tính reactions summary
  const { top, total, hasReactions } = useMemo(() => {
    const result = convertReactionsWithTopAndTotal(message.reactions || []);
    return {
      ...result,
      hasReactions: result.top.length > 0,
    };
  }, [message.reactions]);

  const mediaStyle =
    message.vWidth && message.vHeight
      ? { width: `${message.vWidth}px`, height: `${message.vHeight}px` }
      : { width: "256px", height: "144px" };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
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
            className="relative group bg-black rounded-md cursor-pointer"
            style={mediaStyle}
          >
            <img
              src={message.thumb}
              alt="Video thumbnail"
              className="object-cover rounded-md w-full h-full"
              crossOrigin="anonymous"
            />
            {/* Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors duration-300">
              {/* Play button */}
              <div
                className="bg-black/20 text-white rounded-full w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg"
                aria-label="Play video"
                onClick={handleClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="translate-x-px"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <MessageDropdownMenu
              sender={message.sender}
              message={message}
              conversationInfo={conversationInfo}
              handleUndo={handleUndo}
              onReply={onReply}
            />

            {/* Reactions summary - chỉ hiển thị số lượng reactions */}
            {hasReactions && (
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
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-full bg-black p-0 border-0">
          <DialogTitle>
            {message?.href?.includes("https") ? (
              <video
                src={message.href}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh]  outline-none"
                style={
                  message.vWidth && message.vHeight
                    ? {
                        aspectRatio: `${message.vWidth} / ${message.vHeight}`,
                      }
                    : {}
                }
              />
            ) : (
              <video
                src={message.href}
                controls
                autoPlay
                className="w-full h-auto max-h-[90vh]  outline-none"
                style={
                  message.vWidth && message.vHeight
                    ? {
                        aspectRatio: `${message.vWidth} / ${message.vHeight}`,
                      }
                    : {}
                }
                crossOrigin="anonymous"
              />
            )}
          </DialogTitle>
          {/* Nút download custom */}
          <div className="flex justify-center relative mt-2">
            <a
              href={message.href}
              download
              target="_blank"
              className="flex items-center gap-2 px-6 py-2 bg-transparent text-white/70 font-light hover:text-white transition-all duration-200"
              style={{ position: "absolute", top: "-40px" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                />
              </svg>
              Download
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
