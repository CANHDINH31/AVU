"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MultiAccountChat } from "@/components/chat/multi-account-chat";
import { ChatRedirect } from "@/components/chat/chat-redirect";
import { useChatContext } from "@/lib/contexts/chat-context";
import { useSocket } from "@/hooks/use-socket";

export default function ChatPage() {
  const router = useRouter();
  const { selectedAccounts, clearSelectedAccounts, isInitialized } =
    useChatContext();
  const { disconnectAll } = useSocket();

  useEffect(() => {
    // Chỉ kiểm tra và redirect khi context đã được khởi tạo xong
    if (isInitialized && selectedAccounts.length === 0) {
      router.push("/dashboard");
    }
  }, [selectedAccounts, router, isInitialized]);

  const handleBack = () => {
    // Disconnect tất cả socket connections trước
    disconnectAll();

    // Clear selected accounts và navigate về dashboard
    clearSelectedAccounts();
    router.push("/dashboard");
  };

  // Hiển thị loading khi context chưa được khởi tạo
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Hiển thị ChatRedirect nếu không có tài khoản nào được chọn
  if (selectedAccounts.length === 0) {
    return <ChatRedirect />;
  }

  return (
    <MultiAccountChat selectedAccounts={selectedAccounts} onBack={handleBack} />
  );
}
