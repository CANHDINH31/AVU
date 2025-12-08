import { MessageCircle } from "lucide-react";

export function EmptyChatState() {
  return (
    <div className="flex-1 flex items-center justify-center h-[90vh] bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center bg-gray-200">
          <MessageCircle className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-3 text-gray-900">
          Chọn một cuộc trò chuyện
        </h3>
        <p className="text-base text-gray-500">
          Chọn cuộc trò chuyện từ danh sách để bắt đầu nhắn tin với khách hàng
        </p>
      </div>
    </div>
  );
}
