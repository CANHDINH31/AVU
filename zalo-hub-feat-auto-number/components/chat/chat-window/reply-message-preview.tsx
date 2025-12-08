import React from "react";
import { X } from "lucide-react";

const ReplyMessagePreview = ({
  message,
  onClose,
}: {
  message: any;
  onClose?: () => void;
}) => {
  if (!message) return null;
  let content = null;
  let typeLabel = "";

  switch (message.msgType) {
    case "chat.photo":
      typeLabel = "[Hình ảnh]";
      content = message.thumb ? (
        <img src={message.thumb} className="w-10 h-10 rounded object-cover" />
      ) : (
        <span>Ảnh</span>
      );
      break;
    case "chat.gif":
      typeLabel = "[GIF]";
      content = (() => {
        // Parse params to get GIF URL
        let gifUrl = "";
        try {
          const params = message.params ? JSON.parse(message.params) : {};
          gifUrl = params.hd || params.small || "";
        } catch (e) {
          console.error("Error parsing GIF params:", e);
        }
        return gifUrl ? (
          <img
            src={gifUrl}
            alt="GIF"
            className="w-10 h-10 rounded object-cover"
          />
        ) : (
          <span>GIF</span>
        );
      })();
      break;
    case "chat.video.msg":
      typeLabel = "[Video]";
      content = message.thumb ? (
        <img
          src={message.thumb}
          alt="Video thumbnail"
          className="w-10 h-10 rounded object-cover"
          crossOrigin="anonymous"
        />
      ) : (
        <span>Video</span>
      );
      break;
    case "chat.sticker":
      typeLabel = "[Sticker]";
      content = message.stickerUrl ? (
        <img src={message.stickerUrl} alt="Sticker" className="w-10 h-10" />
      ) : (
        <span>Sticker</span>
      );
      break;
    case "share.file":
      typeLabel = `[File] ${message.title}`;
      content = <div className="max-w-[120px]"></div>;
      break;
    case "chat.recommended":
      if (message.action === "recommened.user") {
        typeLabel = `[Danh thiếp] ${message.title}`;
        content = (
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={message?.thumb}
          />
        );
      } else if (message.action === "recommened.link") {
        typeLabel = `[Link] ${message?.href}`;
        content = (
          <img
            className="w-12 h-12  object-cover rounded-lg"
            src={message?.thumb}
          />
        );
      }
      break;
    case "chat.voice":
      typeLabel = `[Tin nhắn thoại]`;
      break;
    default:
      typeLabel = message.content;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200 relative">
      {/* Blue line on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>

      {/* Content */}
      <div className="flex gap-2">
        <div>{content}</div>
        <div className="ml-3 pr-8">
          {/* Reply indicator */}
          <span className="font-semibold text-blue-700 text-xs truncate">
            Trả lời:
          </span>

          {/* Message preview */}
          <div className="text-xs text-gray-600 line-clamp-2 break-all">
            {typeLabel}
          </div>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
          aria-label="Đóng trả lời"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
};

export default ReplyMessagePreview;
