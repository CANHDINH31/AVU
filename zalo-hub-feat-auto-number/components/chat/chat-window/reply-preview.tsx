import React from "react";
import { LinkifyText } from "@/components/ui/LinkifyText";

const ReplyPreview = ({
  replyTo,
  text,
  sender,
}: {
  replyTo: any;
  text: string;
  sender: string;
}) => {
  if (!replyTo) return null;
  let content = null;
  let typeLabel = "";

  switch (replyTo.msgType) {
    case "chat.photo":
      typeLabel = "[Hình ảnh]";
      content = replyTo.thumb ? (
        <img src={replyTo.thumb} className="w-10 h-10 rounded object-cover" />
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
          const params = replyTo.params ? JSON.parse(replyTo.params) : {};
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
      content = replyTo.thumb ? (
        <img
          src={replyTo.thumb}
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
      content = replyTo.stickerUrl ? (
        <img src={replyTo.stickerUrl} alt="Sticker" className="w-10 h-10" />
      ) : (
        <span>Sticker</span>
      );
      break;
    case "share.file":
      typeLabel = `[File] ${replyTo.title}`;
      content = <div className="max-w-[120px]"></div>;
      break;
    case "chat.voice":
      typeLabel = `[Tin nhắn thoại]`;
      break;
    case "chat.recommended":
      if (replyTo.action === "recommened.user") {
        typeLabel = `[Danh thiếp] ${replyTo.title}`;
        content = (
          <img
            className="w-12 h-12 rounded-full object-cover"
            src={replyTo?.thumb}
          />
        );
      } else if (replyTo.action === "recommened.link") {
        typeLabel = `[Link] ${replyTo?.href}`;
        content = (
          <img
            className="w-12 h-12  object-cover rounded-lg"
            src={replyTo?.thumb}
          />
        );
      }
      break;

    default:
      typeLabel = replyTo.content;
  }

  const handleClick = () => {
    if (replyTo?.id) {
      const el = document.getElementById(`message-${replyTo.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        el.classList.add(
          "bg-sky-100",
          "transition",
          "duration-500",
          "rounded-lg"
        );

        setTimeout(() => {
          el.classList.remove("bg-sky-100");
        }, 1500);
      }
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <div
        className={`flex gap-2 ${
          sender === "me" ? "bg-blue-200" : "bg-gray-100"
        } border-l-4 border-blue-400 rounded-lg p-2 mb-1 shadow-sm`}
      >
        {replyTo.undo === 1 ? (
          <div className="flex items-start flex-col gap-1">
            <span className="font-semibold text-blue-700 text-xs truncate">
              Trả lời:
            </span>
            <div className="text-sm text-gray-500 italic">
              Tin nhắn đã được thu hồi
            </div>
          </div>
        ) : (
          <>
            <div>{content}</div>
            <div>
              <div className="flex items-start flex-col gap-1">
                <span className="font-semibold text-blue-700 text-xs truncate">
                  Trả lời:
                </span>
                {typeLabel && (
                  <span className="text-xs text-gray-600 line-clamp-2 max-w-[160px] break-all">
                    {typeLabel}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap leading-relaxed">
        <span>
          <LinkifyText text={text} />
        </span>
      </p>
    </div>
  );
};
export default ReplyPreview;
