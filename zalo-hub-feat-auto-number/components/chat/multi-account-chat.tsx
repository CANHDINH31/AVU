"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Users, Phone } from "lucide-react";
import { ChatSidebar, ChatSidebarRef } from "./chat-sidebar";
import { ContactsSidebar } from "./contacts-sidebar";
import { MainChatWindow } from "./main-chat-window";
import { accountApi, reactionApi } from "@/lib/api";
import { useConversationsByAccounts } from "@/hooks/use-conversations";
import { useSocket } from "@/hooks/use-socket";
import { messageApi } from "@/lib/api";
import { useFriendsByAccounts } from "@/hooks/use-friends";
import { useFriendRequestsByAccounts } from "@/hooks/use-friend-requests";
import { useSentFriendRequestsByAccounts } from "@/hooks/use-sent-friend-requests";

type TabType = "messages" | "contacts" | "phone-numbers" | "settings";

interface MultiAccountChatProps {
  selectedAccounts: string[];
  onBack: () => void;
}

export function MultiAccountChat({
  selectedAccounts,
  onBack,
}: MultiAccountChatProps) {
  const [activeTab, setActiveTab] = useState<TabType>("messages");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const chatSidebarRef = useRef<ChatSidebarRef>(null);

  // Queries
  const { conversations, isLoading, refetch } =
    useConversationsByAccounts(selectedAccounts);

  // Queries
  const { friends, isLoading: isLoadingFriends } =
    useFriendsByAccounts(selectedAccounts);

  // Queries
  const { friendRequests, isLoading: isLoadingFriendRequests } =
    useFriendRequestsByAccounts(selectedAccounts);

  // Queries for sent friend requests
  const { sentFriendRequests, isLoading: isLoadingSentFriendRequests } =
    useSentFriendRequestsByAccounts(selectedAccounts);

  const { data: zaloAccounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountApi.me(),
  });

  // Memoized values
  const disconnectedAccounts = useMemo(
    () =>
      zaloAccounts.filter(
        (acc) =>
          selectedAccounts.includes(acc.id?.toString() || "") &&
          acc.isConnect === 0
      ),
    [zaloAccounts, selectedAccounts]
  );

  // Memoized conversation IDs for efficient lookup
  const conversationIds = useMemo(
    () => new Set(conversations.map((conv) => conv.id.toString())),
    [conversations]
  );

  // URL synchronization - keep conversation param in URL, only update state when valid
  useEffect(() => {
    const conversationParam = searchParams.get("conversation");

    if (conversationParam) {
      // Always keep the conversation param in URL, don't remove it
      const trimmedParam = conversationParam.trim();

      // Only update context state if conversation exists in our list
      if (conversationIds.has(trimmedParam)) {
        if (selectedConversation !== trimmedParam) {
          setSelectedConversation(trimmedParam);
        }
      } else {
        // Conversation doesn't exist in our list, but keep URL param
        // This allows the conversation to be restored when it becomes available
        // Only clear context state, not URL
        if (selectedConversation === trimmedParam) {
          setSelectedConversation(null);
        }
      }
    } else {
      // No conversation param in URL, but check if we have one in context
      if (selectedConversation && conversationIds.has(selectedConversation)) {
        // We have a valid conversation in context but not in URL, restore URL
        const params = new URLSearchParams(searchParams);
        params.set("conversation", selectedConversation);
        const newUrl = `?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);
        window.dispatchEvent(new PopStateEvent("popstate"));
      } else if (selectedConversation) {
        // Invalid conversation in context, clear it
        setSelectedConversation(null);
      }
    }
  }, [
    searchParams,
    conversationIds,
    selectedConversation,
    conversations.length,
  ]);

  const { onNewMessage, onNewReaction, removeEventListener, onNewUndo } =
    useSocket();

  // Ref lưu callback cho từng accountId
  const refetchCallbacks = useRef(new Map());

  useEffect(() => {
    selectedAccounts.forEach((accountId) => {
      const cb = () => refetch();
      refetchCallbacks.current.set(accountId, cb);
      onNewMessage(Number(accountId), cb);
      onNewReaction(Number(accountId), cb);
      onNewUndo(Number(accountId), cb);
    });
    return () => {
      selectedAccounts.forEach((accountId) => {
        const cb = refetchCallbacks.current.get(accountId);
        if (cb) {
          removeEventListener(Number(accountId), "new_message", cb);
          removeEventListener(Number(accountId), "new_reaction", cb);
          refetchCallbacks.current.delete(accountId);
        }
      });
    };
  }, [
    selectedAccounts,
    onNewMessage,
    onNewUndo,
    onNewReaction,
    removeEventListener,
    refetch,
  ]);

  // Event handlers
  const handleBack = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete("conversation");
    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
    // Dispatch custom event để notify các component khác
    window.dispatchEvent(new PopStateEvent("popstate"));
    onBack();
  }, [searchParams, onBack]);

  const handleTabChange = useCallback(
    (tab: TabType) => {
      if (tab === "phone-numbers") {
        // Navigate to phone-numbers page
        router.push("/phone-numbers");
      } else {
        setActiveTab(tab);
      }
    },
    [router]
  );

  // Handler để chọn conversation và mark as read
  const handleSelectConversation = useCallback(
    async (conversationId: string) => {
      try {
        // Mark conversation as read
        await messageApi.markConversationAsRead(conversationId);
        await reactionApi.markConversationAsRead(conversationId);

        // Update selected conversation
        setSelectedConversation(conversationId);

        // Refetch conversations to update unread count
        refetch();
      } catch (error) {
        console.error("Failed to mark conversation as read:", error);
        // Still update selected conversation even if mark as read fails
        setSelectedConversation(conversationId);
      }
    },
    [refetch]
  );

  const handleSelectFriend = (conversationId: string) => {
    setActiveTab("messages");
    setSelectedConversation(conversationId);
    setShouldScroll(true); // Enable scroll when coming from contacts tab

    // Update URL param
    const params = new URLSearchParams(window.location.search);
    params.set("conversation", conversationId);
    const newUrl = `?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);
    // Dispatch custom event để notify các component khác (ChatSidebar lắng nghe popstate)
    window.dispatchEvent(new PopStateEvent("popstate"));

    // Scroll to conversation after a short delay to ensure the tab change is complete
    setTimeout(() => {
      if (chatSidebarRef.current) {
        chatSidebarRef.current.scrollToConversation(conversationId);
      }
      // Reset shouldScroll after scrolling
      setShouldScroll(false);
    }, 200);
  };

  // Handler để xử lý pin/unpin conversation
  const handlePinToggle = useCallback(async () => {
    refetch();
  }, [selectedAccounts]);

  // Navigation items configuration
  const navigationItems = useMemo(
    () => [
      { id: "messages" as TabType, icon: MessageCircle, label: "Messages" },
      { id: "contacts" as TabType, icon: Users, label: "Contacts" },
      { id: "phone-numbers" as TabType, icon: Phone, label: "Phone Numbers" },
    ],
    []
  );

  return (
    <div className="h-screen max-h-screen overflow-y-hidden flex bg-white">
      {/* Left Sidebar Navigation */}
      <div className="w-16 border-r flex flex-col items-center py-4 space-y-4 bg-gray-50 border-gray-200">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="w-12 h-12"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        {/* Navigation Icons */}
        <div className="flex flex-col space-y-2 pt-4">
          {navigationItems.map(({ id, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              size="icon"
              onClick={() => handleTabChange(id)}
              className={`w-12 h-12 text-gray-600 hover:bg-gray-100 ${
                activeTab === id
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : ""
              }`}
            >
              <Icon className="w-6 h-6" />
            </Button>
          ))}
        </div>
      </div>

      {/* Content Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700">
        {activeTab === "messages" && (
          <ChatSidebar
            ref={chatSidebarRef}
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            onPinToggle={handlePinToggle}
            isLoading={isLoading}
            shouldScroll={shouldScroll}
          />
        )}
        {activeTab === "contacts" && (
          <ContactsSidebar
            friends={friends}
            isLoading={isLoadingFriends}
            friendRequests={friendRequests}
            sentFriendRequests={sentFriendRequests}
            isLoadingFriendRequests={isLoadingFriendRequests}
            isLoadingSentFriendRequests={isLoadingSentFriendRequests}
            onSelectConversation={(conversationId) =>
              handleSelectFriend(conversationId)
            }
          />
        )}
      </div>

      {/* Main Chat Window */}
      <MainChatWindow
        accounts={selectedAccounts}
        disconnectedAccounts={disconnectedAccounts}
      />
    </div>
  );
}
