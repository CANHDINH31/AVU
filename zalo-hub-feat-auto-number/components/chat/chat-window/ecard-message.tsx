import React from "react";

interface EcardMessageProps {
  message: any;
  conversationInfo: any;
}

export const EcardMessage: React.FC<EcardMessageProps> = ({
  message,
  conversationInfo,
}) => {
  // Nếu msgType là chat.ecard và action là show.profile
  // Hiển thị thông tin sinh nhật
  // Ưu tiên lấy từ message, nếu không có thì dùng giá trị mặc định
  const title = message.title;
  const description = message.description || "Hãy gửi lời chúc tốt đẹp!";
  const imageUrl =
    message.href ||
    message.thumb ||
    "https://res-zalo.zadn.vn/upload/media/2020/2/7/2x_ecardsn_1581058405234_716426.png";

  return (
    <div
      className={`flex ${
        message.sender === "me" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-center max-w-xs lg:max-w-md group gap-1">
        {message.sender !== "me" && (
          <div className="flex-shrink-0">
            <img
              src={conversationInfo.friend?.avatar || "/placeholder.svg"}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}

        <div className="relative">
          <div
            className={`relative rounded-2xl overflow-hidden max-w-full ${
              message.sender === "me"
                ? "bg-[#e6f0fd] text-[#1967d2]"
                : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            {/* Image */}
            {imageUrl && (
              <div className="w-full">
                <img
                  src={imageUrl}
                  alt="Birthday card"
                  className="w-full object-cover"
                  style={{ maxHeight: "200px" }}
                />
              </div>
            )}

            {/* Content */}
            <div className="px-4 pb-4 pt-3">
              <div
                className={`font-semibold text-[15px] mb-2.5 leading-snug tracking-tight ${
                  message.sender === "me" ? "text-[#1967d2]" : "text-gray-900"
                }`}
                style={{
                  fontWeight: 600,
                  lineHeight: "1.35",
                  letterSpacing: "-0.01em",
                }}
              >
                {title}
              </div>
              <div
                className={`text-[13px] leading-relaxed ${
                  message.sender === "me"
                    ? "text-[#1967d2] opacity-75"
                    : "text-gray-600"
                }`}
                style={{
                  lineHeight: "1.5",
                  letterSpacing: "0.01em",
                }}
              >
                {description}
              </div>
            </div>
          </div>
        </div>

        {message.sender === "me" && (
          <div className="flex-shrink-0">
            <img
              src={conversationInfo.account?.avatar || "/placeholder.svg"}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
      </div>
    </div>
  );
};
