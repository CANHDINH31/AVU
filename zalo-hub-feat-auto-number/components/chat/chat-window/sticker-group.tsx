import React, { useState, useEffect, useMemo } from "react";
import { MessageDropdownMenu } from "./message-dropdown-menu";
import { Message } from "@/lib/types/message";

export function StickerGroup({
  group,
  conversationInfo,
  handleUndo,
  onReply,
}: {
  group: any;
  conversationInfo: any;
  handleUndo: (message: Message, callback?: () => void) => void;
  onReply?: (message: Message) => void;
}) {
  const defaultMessage = useMemo(
    () => group.stickers?.[0] as Message | undefined,
    [group.stickers]
  );
  const [activeMessage, setActiveMessage] = useState<Message | undefined>(
    defaultMessage
  );

  useEffect(() => {
    setActiveMessage(defaultMessage);
  }, [defaultMessage]);

  const bubbleClasses =
    group.sender === "me"
      ? "bg-[#e6f0fd] border border-[#c9dcff]"
      : "bg-white border border-gray-200";

  return (
    <div
      className={`flex gap-2 mb-2 ${
        group.sender === "me" ? "flex-row-reverse" : ""
      }`}
      style={{ alignItems: "center" }}
    >
      {group.sender === "other" && (
        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
          <img
            src={conversationInfo.friend?.avatar || "/placeholder.svg"}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      )}

      <div className="relative group max-w-[320px]">
        <div
          className={`flex flex-wrap justify-center gap-3 px-3 py-2 rounded-2xl shadow-sm ${bubbleClasses}`}
        >
          {group.stickers.map((msg: any) => {
            const elementId = `message-${msg.id}`;
            if (msg.stickerTotalFrames === 0) {
              return (
                <div
                  id={elementId}
                  key={elementId}
                  onMouseEnter={() => setActiveMessage(msg)}
                  onFocus={() => setActiveMessage(msg)}
                >
                  <StaticSticker msg={msg} onHover={setActiveMessage} />
                </div>
              );
            }

            return (
              <div
                id={elementId}
                key={elementId}
                onMouseEnter={() => setActiveMessage(msg)}
                onFocus={() => setActiveMessage(msg)}
              >
                <AnimatedSticker msg={msg} onHover={setActiveMessage} />
              </div>
            );
          })}
        </div>

        {activeMessage && (
          <MessageDropdownMenu
            sender={activeMessage.sender || group.sender}
            message={activeMessage}
            conversationInfo={conversationInfo}
            handleUndo={handleUndo}
            onReply={onReply}
          />
        )}
      </div>
    </div>
  );
}

// Component cho sticker tĩnh
function StaticSticker({
  msg,
  onHover,
}: {
  msg: any;
  onHover: (message: Message) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const frameSize = getFrameSizeFromUrl(msg.stickerSpriteUrl);
  const displaySize = frameSize || 130;

  return (
    <div
      style={{
        width: displaySize,
        height: displaySize,
        display: "inline-block",
        position: "relative",
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(msg);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      {!isHovered && (
        <img
          src={msg.stickerUrl}
          style={{ width: displaySize, height: displaySize, display: "block" }}
        />
      )}
      {msg.stickerSpriteUrl && isHovered && (
        <img
          src={msg.stickerSpriteUrl}
          style={{
            width: displaySize,
            height: displaySize,
            display: "block",
            objectFit: "cover",
          }}
        />
      )}
    </div>
  );
}

// Component cho sticker có animation
function AnimatedSticker({
  msg,
  onHover,
}: {
  msg: any;
  onHover: (message: Message) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameSize = getFrameSizeFromUrl(msg.stickerSpriteUrl);
  const displaySize = frameSize || 130;

  useEffect(() => {
    if (!isHovered || !msg.stickerSpriteUrl) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % msg.stickerTotalFrames);
    }, msg.stickerDuration);

    return () => clearInterval(interval);
  }, [
    isHovered,
    msg.stickerSpriteUrl,
    msg.stickerTotalFrames,
    msg.stickerDuration,
  ]);

  return (
    <div
      style={{
        width: displaySize,
        height: displaySize,
        display: "inline-block",
        position: "relative",
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onHover(msg);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      {!isHovered && (
        <img
          src={msg.stickerUrl}
          style={{ width: displaySize, height: displaySize, display: "block" }}
        />
      )}
      {msg.stickerSpriteUrl && isHovered && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: displaySize,
            height: displaySize,
            backgroundImage: `url(${msg.stickerSpriteUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: `-${currentFrame * displaySize}px 0px`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

function getFrameSizeFromUrl(url?: string): number {
  if (!url) return 130;
  const match = url.match(/[?&]size=(\d+)/);
  return match ? parseInt(match[1], 10) : 130;
}
