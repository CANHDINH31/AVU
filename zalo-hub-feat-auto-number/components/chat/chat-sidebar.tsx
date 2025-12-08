"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSearchParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Conversation } from "@/lib/types/conversation";
import { ChatSidebarHeader } from "./chat-sidebar-header";
import { ChatSidebarList, ChatSidebarListRef } from "./chat-sidebar-list";
import { useDebounce } from "@/hooks/use-debounce";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onPinToggle?: () => void;
  isLoading: boolean;
  shouldScroll?: boolean;
}

export interface ChatSidebarRef {
  scrollToConversation: (conversationId: string) => void;
}

export const ChatSidebar = forwardRef<ChatSidebarRef, ChatSidebarProps>(
  (
    {
      conversations,
      selectedConversation,
      onSelectConversation,
      onPinToggle,
      isLoading,
      shouldScroll = false,
    },
    ref
  ) => {
    const searchParams = useSearchParams();
    const sidebarListRef = useRef<ChatSidebarListRef>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [filterMode, setFilterMode] = useState<
      "all" | "byAccount" | "strangers"
    >("all");
    const [selectedAccountId, setSelectedAccountId] = useState<string>("");

    // Debounce search query để tránh re-render quá nhiều
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Expose scrollToConversation method
    useImperativeHandle(ref, () => ({
      scrollToConversation: (conversationId: string) => {
        if (sidebarListRef.current) {
          sidebarListRef.current.scrollToConversation(conversationId);
        }
      },
    }));

    // Lấy danh sách tài khoản duy nhất từ conversations
    const uniqueAccounts = useMemo(() => {
      const accounts = conversations.reduce((acc, conv) => {
        const accountId = conv.account_id.toString();
        if (!acc.find((acc) => acc.id === accountId)) {
          acc.push({
            id: accountId,
            displayName: conv.account?.displayName || "Unknown Account",
            username: conv.account?.username || "",
          });
        }
        return acc;
      }, [] as Array<{ id: string; displayName: string; username: string }>);

      return accounts.sort((a, b) =>
        a.displayName.localeCompare(b.displayName)
      );
    }, [conversations]);

    // Kiểm tra có người lạ hay không
    const hasStrangers = useMemo(() => {
      return conversations.some((conv) => conv.friend.isFr === 0);
    }, [conversations]);

    // Lọc conversations theo filter mode và search - tối ưu với useMemo
    const filteredConversations = useMemo(() => {
      let filtered = conversations;

      // Lọc theo mode
      if (filterMode === "byAccount" && selectedAccountId) {
        filtered = filtered.filter(
          (conv) => conv.account_id.toString() === selectedAccountId
        );
      } else if (filterMode === "strangers") {
        // Lọc chỉ hiển thị người lạ (isFr = 0)
        filtered = filtered.filter((conv) => conv.friend.isFr === 0);
      }

      // Lọc theo search (sử dụng debounced query)
      if (debouncedSearchQuery.trim()) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        filtered = filtered.filter((conv) => {
          const name =
            conv.friend.displayName ||
            conv.friend.username ||
            conv.friend.zaloName ||
            `Friend ${conv.friend.id}`;
          return name.toLowerCase().includes(searchLower);
        });
      }

      // Sắp xếp conversations: ghim lên đầu, sau đó theo thời gian tin nhắn cuối
      filtered.sort((a, b) => {
        // Conversations được ghim lên đầu
        if (a.isPinned === 1 && b.isPinned !== 1) return -1;
        if (a.isPinned !== 1 && b.isPinned === 1) return 1;

        // Sau đó sắp xếp theo thời gian tin nhắn cuối (mới nhất lên đầu)
        const aTime = a.messages?.[0]?.createdAt || a.updatedAt || new Date(0);
        const bTime = b.messages?.[0]?.createdAt || b.updatedAt || new Date(0);
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      return filtered;
    }, [conversations, filterMode, selectedAccountId, debouncedSearchQuery]);

    // Scroll to conversation when selectedConversation changes
    useEffect(() => {
      if (selectedConversation && sidebarListRef.current && shouldScroll) {
        // Add a small delay to ensure the list is rendered
        setTimeout(() => {
          sidebarListRef.current?.scrollToConversation(selectedConversation);
        }, 100);
      }
    }, [selectedConversation, shouldScroll]);

    // Hàm xử lý thay đổi filter mode - chỉ cập nhật local state
    const handleFilterModeChange = useCallback(
      (value: "all" | "byAccount" | "strangers") => {
        setFilterMode(value);
        if (value === "all") {
          setSelectedAccountId("");
        }
      },
      []
    );

    // Hàm xử lý thay đổi selected account - chỉ cập nhật local state
    const handleSelectedAccountChange = useCallback((accountId: string) => {
      setSelectedAccountId(accountId);
    }, []);

    // Hàm xử lý xóa bộ lọc - chỉ cập nhật local state
    const handleClearFilter = useCallback(() => {
      setSelectedAccountId("");
    }, []);

    // Hàm xử lý khi click vào cuộc hội thoại - chỉ cập nhật conversation param
    const handleConversationClick = useCallback(
      (conversationId: string) => {
        // Cập nhật URL với params conversation
        const params = new URLSearchParams(searchParams);
        params.set("conversation", conversationId);
        const newUrl = `?${params.toString()}`;
        window.history.replaceState({}, "", newUrl);

        // Dispatch custom event để notify các component khác
        window.dispatchEvent(new PopStateEvent("popstate"));

        // Gọi callback để cập nhật state
        onSelectConversation(conversationId);
      },
      [searchParams, onSelectConversation]
    );

    // Reset selected account khi chuyển về mode "all"
    useEffect(() => {
      if (filterMode === "all") {
        setSelectedAccountId("");
      }
    }, [filterMode]);

    // Reset filter mode nếu không có người lạ và đang ở mode strangers
    useEffect(() => {
      if (!hasStrangers && filterMode === "strangers") {
        setFilterMode("all");
      }
    }, [hasStrangers, filterMode]);

    return (
      <TooltipProvider>
        <div className="h-full flex flex-col bg-white">
          <ChatSidebarHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterMode={filterMode}
            onFilterModeChange={handleFilterModeChange}
            selectedAccountId={selectedAccountId}
            onSelectedAccountChange={handleSelectedAccountChange}
            onClearFilter={handleClearFilter}
            uniqueAccounts={uniqueAccounts}
            filteredConversationsCount={filteredConversations.length}
            hasStrangers={hasStrangers}
          />
          <ChatSidebarList
            ref={sidebarListRef}
            isLoading={isLoading}
            conversations={conversations}
            filteredConversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleConversationClick}
            onPinToggle={onPinToggle}
            filterMode={filterMode}
            selectedAccountId={selectedAccountId}
            shouldScroll={shouldScroll}
          />
        </div>
      </TooltipProvider>
    );
  }
);

ChatSidebar.displayName = "ChatSidebar";
