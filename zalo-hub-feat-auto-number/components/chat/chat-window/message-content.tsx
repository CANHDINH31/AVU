import React from "react";
import { LinkifyText } from "@/components/ui/LinkifyText";
import { RecommendedLink } from "./recommended-link";
import { SharedFileMessage } from "./shared-file-message";
import ReplyPreview from "./reply-preview";
import { VoiceMessage } from "./voice-message";
import { RecommendedUser } from "./recommended-user";
import { PhotoThumb } from "./photo-thumb";

interface MessageContentProps {
  message: any;
}

export const MessageContent = React.memo(function MessageContent(
  props: MessageContentProps
) {
  const { message } = props;

  if (message.replyTo?.id) {
    return (
      <ReplyPreview
        replyTo={message.replyTo}
        text={message?.content}
        sender={message.sender}
      />
    );
  }

  if (message.msgType === "chat.recommended") {
    if (message.action === "recommened.link")
      return (
        <RecommendedLink
          title={message.title}
          mediaTitle={JSON.parse(message?.params)?.mediaTitle}
          description={message.description}
          href={message.href}
          thumb={message.thumb}
        />
      );

    if (message.action === "recommened.user")
      return (
        <RecommendedUser
          thumb={message?.thumb}
          name={message.title || message.name || "Unknown"}
          phone={JSON.parse(message?.description)?.phone || ""}
          qrImage={JSON.parse(message?.description)?.qrCodeUrl || ""}
        />
      );
  }

  if (message.msgType === "chat.voice") {
    return <VoiceMessage message={message} />;
  }

  if (message.msgType === "chat.photo") {
    const thumbSize = 160;
    const isSendingPlaceholder = (message as any)?.isPlaceholder;
    const isSending =
      isSendingPlaceholder && message.messageStatus === "sending";
    const isFailed = message.messageStatus === "failed";
    const isExpired = message.isExpired === 0;

    return (
      <div className="relative flex flex-col items-center">
        <div
          className="w-full max-w-[180px] relative rounded-md overflow-hidden"
          style={{
            minWidth: thumbSize,
            maxWidth: thumbSize,
            height: thumbSize,
          }}
        >
          {isExpired ? (
            // Hiển thị placeholder ảnh lỗi khi expired
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          ) : (
            <PhotoThumb url={message.href || message.thumb} size={thumbSize} />
          )}

          {isSending && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md">
              <div className="flex items-center gap-2 text-white text-xs">
                <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                <span>Đang tải ảnh...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (message.msgType === "share.file") {
    return (
      <SharedFileMessage
        file={{
          title: message.title,
          href: message.href,
          size: message.fileSize,
          fileExt: message.fileExt,
        }}
        isExpired={message.isExpired === 0}
      />
    );
  }

  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">
      <span>
        <LinkifyText text={message.content} />
      </span>
    </p>
  );
});
