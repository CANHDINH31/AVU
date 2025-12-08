"use client";

import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getUser, removeUser } from "@/lib/auth";
import { useChatContext } from "@/lib/contexts/chat-context";

export default function DashboardPage() {
  const router = useRouter();
  const user = getUser();
  const { setSelectedAccounts } = useChatContext();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      removeUser();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleViewChange = (view: "dashboard" | "accounts" | "chat") => {
    router.push(`/${view}`);
  };

  const handleStartMultiChat = (accountIds: string[]) => {
    setSelectedAccounts(accountIds);
    router.push("/chat");
  };

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      onViewChange={handleViewChange}
      onStartMultiChat={handleStartMultiChat}
    />
  );
}
