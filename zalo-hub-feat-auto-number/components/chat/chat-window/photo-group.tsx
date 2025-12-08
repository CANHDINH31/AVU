import React, { useEffect, useMemo, useState } from "react";
import { PhotoTitleItem } from "./photo-title-item";
import { PhotoNoTitleItem } from "./photo-no-title-item";
import { Message } from "@/lib/types/message";
import { MessageDropdownMenu } from "./message-dropdown-menu";

export function PhotoGroup({
  group,
  conversationInfo,
  formatTimeHHmm,
  accountIds,
  openReactionsModal,
  handleUndo,
  onReply,
}: {
  group: any;
  conversationInfo: any;
  formatTimeHHmm: (dateString: string) => string;
  accountIds: string[];
  openReactionsModal: (message: any, accountIds: string[]) => void;
  handleUndo: (message: Message, callback?: () => void) => void;
  onReply?: (message: Message) => void;
}) {
  return (
    <div
      className={`flex gap-2 mb-2 ${
        group.sender === "me" ? "flex-row-reverse" : ""
      }`}
      style={{ alignItems: "end" }}
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
      <PhotoGroupBubble
        group={group}
        conversationInfo={conversationInfo}
        handleUndo={handleUndo}
        onReply={onReply}
        formatTimeHHmm={formatTimeHHmm}
        accountIds={accountIds}
        openReactionsModal={openReactionsModal}
      />
    </div>
  );
}

function PhotoGroupBubble({
  group,
  conversationInfo,
  handleUndo,
  onReply,
  formatTimeHHmm,
  accountIds,
  openReactionsModal,
}: {
  group: any;
  conversationInfo: any;
  handleUndo: (message: Message, callback?: () => void) => void;
  onReply?: (message: Message) => void;
  formatTimeHHmm: (dateString: string) => string;
  accountIds: string[];
  openReactionsModal: (message: any, accountIds: string[]) => void;
}) {
  const defaultMessage = useMemo(
    () => group.photos?.[0] as Message | undefined,
    [group.photos]
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

  const columns = Math.min(
    group.photos.length,
    group.photos.length > 1 ? 2 : 1
  );
  const shouldShowGroupMenu =
    group.photos.length > 1 ||
    group.photos.some((message: any) => !message.title);
  const hasMultiplePhotos = group.photos.length > 1;
  const photoThumbSize = hasMultiplePhotos ? 120 : 160;

  return (
    <div className="relative group max-w-[360px]">
      <div
        className={`px-3 py-2 rounded-2xl shadow-sm ${bubbleClasses}`}
        style={{ minWidth: 200 }}
      >
        <div
          className="grid gap-2 justify-items-center"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {group.photos.map((msg: any) => {
            const isMe = msg.sender === "me";
            return msg.title ? (
              <div
                id={`message-${msg.id}`}
                key={msg.id}
                onMouseEnter={() => setActiveMessage(msg)}
                onFocus={() => setActiveMessage(msg)}
              >
                <PhotoTitleItem
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  conversationInfo={conversationInfo}
                  formatTimeHHmm={formatTimeHHmm}
                  accountIds={accountIds}
                  openReactionsModal={openReactionsModal}
                  handleUndo={handleUndo}
                  onReply={onReply}
                  hideDropdownMenu={hasMultiplePhotos}
                  hideReactions={hasMultiplePhotos}
                />
              </div>
            ) : (
              <div id={`message-${msg.id}`} key={msg.id}>
                <PhotoNoTitleItem
                  msg={msg}
                  accountIds={accountIds}
                  openReactionsModal={openReactionsModal}
                  onHover={setActiveMessage}
                  thumbSize={photoThumbSize}
                  hideReactions={hasMultiplePhotos}
                />
              </div>
            );
          })}
        </div>
      </div>

      {shouldShowGroupMenu && activeMessage && (
        <MessageDropdownMenu
          sender={activeMessage.sender || group.sender}
          message={activeMessage}
          conversationInfo={conversationInfo}
          handleUndo={handleUndo}
          onReply={onReply}
        />
      )}
    </div>
  );
}
