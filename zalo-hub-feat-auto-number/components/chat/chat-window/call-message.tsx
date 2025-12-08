import React from "react";
import { Phone, PhoneOff } from "lucide-react";

interface CallMessageProps {
  message: any;
  conversationInfo: any;
  formatTimeHHmm: (dateString: string) => string;
}

export const CallMessage: React.FC<CallMessageProps> = ({
  message,
  conversationInfo,
  formatTimeHHmm,
}) => {
  const isCallSuccess = message.action === "recommened.calltime";
  const isCallMissed = message.action === "recommened.misscall";

  let duration = 0;
  let reason: any = "";

  try {
    const params = JSON.parse(message?.params);
    duration = params?.duration || 0;
    reason = params?.reason || "";
  } catch (e) {
    console.error("Invalid params JSON", e);
  }

  const getCallIcon = () => {
    if (isCallMissed) return <PhoneOff className="w-4 h-4" />;
    if (isCallSuccess) return <Phone className="w-4 h-4" />;
    return null;
  };

  const getCallText = () => {
    if (isCallSuccess) {
      return "Cuộc gọi thành công";
    }

    switch (reason) {
      case 2:
        return "Cuộc gọi bị nhỡ";
      case 3:
        return "Cuộc gọi đã bị từ chối";
      case "busy":
        return "Người nhận đang bận";
      default:
        return "Cuộc gọi nhỡ";
    }
  };

  const getDurationText = () => {
    if (!duration) return null;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes} phút ${seconds} giây`;
  };

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
            className={`relative px-4 py-3 rounded-2xl max-w-full ${
              message.sender === "me"
                ? "bg-[#e6f0fd] text-[#1967d2]"
                : "bg-white text-gray-900 border border-gray-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <div
                className={`flex-shrink-0 ${
                  isCallSuccess ? "text-green-500" : "text-red-500"
                }`}
              >
                {getCallIcon()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{getCallText()}</div>
                {isCallSuccess && duration > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    Thời lượng: {getDurationText()}
                  </div>
                )}
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
