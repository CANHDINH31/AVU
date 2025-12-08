import React from "react";

interface LastMessageContentProps {
  lastMessage: string | undefined;
  isSeft: boolean;
  conversation: any;
}

export function LastMessageContent({
  lastMessage,
  isSeft,
  conversation,
}: LastMessageContentProps) {
  if (!lastMessage) {
    return <span className="italic text-gray-400">Chưa có tin nhắn nào</span>;
  }
  if ((conversation.messages?.[0] as any)?.undo === 1) {
    return (
      <>
        {isSeft && <>Bạn: </>}
        <span className="italic text-gray-400">Tin nhắn đã được thu hồi</span>
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.recommended") {
    if ((conversation.messages?.[0] as any)?.action === "recommened.link") {
      return (
        <>
          <span className="inline-block align-middle mr-1">
            {/* Icon tệp đính kèm */}
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M17.657 6.343a6 6 0 0 0-8.485 0l-5.657 5.657a6 6 0 1 0 8.485 8.485l6.364-6.364a4 4 0 1 0-5.657-5.657l-6.364 6.364 1.414 1.414 6.364-6.364a2 2 0 1 1 2.828 2.828l-6.364 6.364a4 4 0 1 1-5.657-5.657l5.657-5.657a4 4 0 0 1 5.657 5.657l-6.364 6.364 1.414 1.414 6.364-6.364a6 6 0 0 0 0-8.485z"
              />
            </svg>
          </span>
          <a
            href={(conversation.messages?.[0] as any)?.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-500 hover:text-blue-700"
          >
            {(conversation.messages?.[0] as any)?.href}
          </a>
        </>
      );
    }
    if ((conversation.messages?.[0] as any)?.action === "recommened.user") {
      return (
        <>
          {isSeft && <>Bạn: </>}
          <span
            className="inline-block align-middle mr-1 text-gray-500"
            title="Danh thiếp"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4V6h16v12zM6 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm2 3c1.3 0 4 .67 4 2v1H4v-1c0-1.33 2.7-2 4-2zm5-3h5v2h-5v-2zm0 4h3v2h-3v-2z"
              />
            </svg>
          </span>
          <span className="align-middle">Danh thiếp</span>
        </>
      );
    }
    if (
      (conversation.messages?.[0] as any)?.action === "recommened.misscall" ||
      (conversation.messages?.[0] as any)?.action === "recommened.calltime"
    ) {
      const msg = conversation.messages?.[0] as any;
      const isCallSuccess = msg?.action === "recommened.calltime";

      let reason: any = "";
      try {
        const params = JSON.parse(msg?.params);
        reason = params?.reason || "";
      } catch (e) {
        console.error("Invalid params JSON", e);
      }

      const getText = () => {
        if (isCallSuccess) return "Cuộc gọi thành công";
        switch (reason) {
          case 2:
            return "Cuộc gọi bị nhỡ";
          case 3:
            return "Cuộc gọi đã bị từ chối";
          case "busy":
            return "Người nhận đang bận";
          default:
            return "Cuộc gọi đã bị từ chối";
        }
      };

      const getIconPath = () => {
        return isCallSuccess
          ? // Phone icon (thành công)
            "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
          : // PhoneOff icon (thất bại)
            "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z";
      };

      return (
        <>
          {isSeft && <>Bạn: </>}
          <span
            className={`inline-block align-middle mr-1 ${
              isCallSuccess ? "text-green-500" : "text-red-500"
            }`}
            title={getText()}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" d={getIconPath()} />
            </svg>
          </span>
          <span
            className={`align-middle ${
              isCallSuccess ? "text-green-500" : "text-red-500"
            }`}
          >
            {getText()}
          </span>
        </>
      );
    }
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.sticker") {
    return (
      <>
        {isSeft && <>Bạn: </>}
        <img
          src={(conversation.messages?.[0] as any)?.stickerUrl}
          alt="sticker"
          className="inline-block w-6 h-6 align-middle"
        />
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.photo") {
    return (
      <>
        {isSeft && <>Bạn: </>}
        <span
          className="inline-block align-middle mr-1 text-gray-500"
          title="Ảnh"
        >
          {/* Icon hình ảnh */}
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm2 0v14h12V5H6zm2 10l2.5-3.01a1 1 0 0 1 1.5 0L16 15l2-2.5V19H6v-4zm2-6a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
            />
          </svg>
        </span>
        <span className="align-middle">Hình ảnh</span>
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.gif") {
    return (
      <>
        {isSeft && <>Bạn: </>}
        <span
          className="inline-block align-middle mr-1 text-gray-500"
          title="GIF"
        >
          {/* Icon hình ảnh (giống ảnh) */}
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm2 0v14h12V5H6zm2 10l2.5-3.01a1 1 0 0 1 1.5 0L16 15l2-2.5V19H6v-4zm2-6a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
            />
          </svg>
        </span>
        <span className="align-middle">GIF</span>
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.video.msg") {
    return (
      <>
        {isSeft && <>Bạn: </>}
        <span
          className="inline-block align-middle mr-1 text-gray-500"
          title="Ảnh"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4z"
            />
          </svg>
        </span>
        <span className="align-middle">Video</span>
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "share.file") {
    const file = conversation.messages?.[0] as any;

    return (
      <>
        <span
          className="inline-flex items-center gap-1 max-w-[180px] align-middle bg-gray-50 px-2 py-0.5 rounded"
          style={{ fontSize: 14, lineHeight: "20px" }}
        >
          {/* Icon file nhỏ đẹp */}
          <span className="flex-shrink-0" style={{ lineHeight: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="4" fill="#2563eb" />
              <path
                d="M7 8h10M7 12h10M7 16h6"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span
            className="truncate text-gray-800"
            title={file?.title}
            style={{
              maxWidth: 140,
              display: "inline-block",
              verticalAlign: "middle",
            }}
          >
            {file?.title || "Tệp đính kèm"}
          </span>
        </span>
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.voice") {
    return (
      <>
        {isSeft && <>Bạn: </>}
        <span
          className="inline-block align-middle mr-1 text-gray-500"
          title="Tin nhắn thoại"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zm-5 8a1 1 0 0 0 1-1v-1h-2v1a1 1 0 0 0 1 1z"
            />
          </svg>
        </span>
        <span className="align-middle">Tin nhắn thoại</span>
      </>
    );
  }
  if ((conversation.messages?.[0] as any)?.msgType === "chat.ecard") {
    const msg = conversation.messages?.[0] as any;
    return (
      <>
        {isSeft && <>Bạn: </>}
        <span
          className="inline-block align-middle mr-1 text-gray-500"
          title="Danh thiếp"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H4V6h16v12zM6 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm2 3c1.3 0 4 .67 4 2v1H4v-1c0-1.33 2.7-2 4-2zm5-3h5v2h-5v-2zm0 4h3v2h-3v-2z"
            />
          </svg>
        </span>
        <span className="align-middle">{msg?.title || "Danh thiếp"}</span>
      </>
    );
  }

  if (isSeft) {
    return <>Bạn: {lastMessage}</>;
  }
  return <>{lastMessage}</>;
}
