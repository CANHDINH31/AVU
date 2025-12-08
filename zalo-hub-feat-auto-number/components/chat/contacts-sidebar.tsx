"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, UserPlus, ArrowLeft, Plus, Send } from "lucide-react";
import { Friend } from "@/lib/types/friend";
import { FriendRequest } from "@/lib/types/friend-request";
import { MainView } from "./contacts-sidebar-main-view";
import { FriendsView } from "./contacts-sidebar-friends-view";
import { FriendRequestsView } from "./contacts-sidebar-friend-requests-view";
import { SentFriendRequestsView } from "./contacts-sidebar-sent-friend-requests-view";
import { SentFriendRequest } from "@/lib/types/sent-friend-request";

export type ViewType =
  | "main"
  | "friends"
  | "communities"
  | "group-invites"
  | "friend-requests"
  | "sent-friend-requests";

interface ContactsSidebarProps {
  friends: Friend[];
  friendRequests: FriendRequest[];
  sentFriendRequests: SentFriendRequest[];
  isLoadingFriendRequests: boolean;
  isLoadingSentFriendRequests: boolean;
  isLoading: boolean;
  onSelectConversation: (conversationId: string) => void;
}

// Hàm sinh màu pastel từ chuỗi (displayName hoặc id) - màu pastel nhẹ nhàng
function getAccountColor(str: string | number) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Màu pastel nhẹ nhàng, phù hợp với cả nền trắng và đen
  return `hsl(${hue}, 60%, 75%)`;
}

export function ContactsSidebar({
  friends,
  friendRequests,
  sentFriendRequests,
  isLoadingFriendRequests,
  isLoadingSentFriendRequests,
  isLoading,
  onSelectConversation,
}: ContactsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [filterMode, setFilterMode] = useState<"all" | "byAccount">("all");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [filterModeRequest, setFilterModeRequest] = useState<
    "all" | "byAccount"
  >("all");
  const [selectedAccountIdRequest, setSelectedAccountIdRequest] =
    useState<string>("");
  const [filterModeSentRequest, setFilterModeSentRequest] = useState<
    "all" | "byAccount"
  >("all");
  const [selectedAccountIdSentRequest, setSelectedAccountIdSentRequest] =
    useState<string>("");

  // Lấy danh sách account duy nhất từ friends
  const uniqueAccounts = useMemo(() => {
    const accounts = friends.reduce((acc, friend) => {
      const accountId = friend.accountId?.toString() || "";
      if (accountId && !acc.find((a) => a.id === accountId)) {
        acc.push({
          id: accountId,
          displayName:
            friend.account?.displayName ||
            friend.zaloName ||
            friend.username ||
            "Unknown Account",
          username: friend.username || "",
        });
      }
      return acc;
    }, [] as Array<{ id: string; displayName: string; username: string }>);
    return accounts.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }, [friends]);

  // Lọc friends theo filterMode, selectedAccountId, searchQuery
  const filteredFriends = useMemo(() => {
    let filtered = friends;
    if (filterMode === "byAccount" && selectedAccountId) {
      filtered = filtered.filter(
        (friend) => friend.accountId?.toString() === selectedAccountId
      );
    }
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((friend) =>
        friend?.zaloName?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [friends, filterMode, selectedAccountId, searchQuery]);

  const handleFilterModeChange = useCallback((mode: "all" | "byAccount") => {
    setFilterMode(mode);
    if (mode === "all") setSelectedAccountId("");
  }, []);

  const handleSelectedAccountChange = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
    setFilterMode("byAccount");
  }, []);

  // Lọc friendRequests theo filterModeRequest, selectedAccountIdRequest, searchQuery
  const filteredFriendRequests = useMemo(() => {
    let filtered = friendRequests;
    if (filterModeRequest === "byAccount" && selectedAccountIdRequest) {
      filtered = filtered.filter(
        (request) => request.accountId?.toString() === selectedAccountIdRequest
      );
    }
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((request) =>
        request?.zaloName?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [
    friendRequests,
    filterModeRequest,
    selectedAccountIdRequest,
    searchQuery,
  ]);

  // Lọc sentFriendRequests theo filterModeSentRequest, selectedAccountIdSentRequest, searchQuery
  const filteredSentFriendRequests = useMemo(() => {
    let filtered = sentFriendRequests;
    if (filterModeSentRequest === "byAccount" && selectedAccountIdSentRequest) {
      filtered = filtered.filter(
        (request) =>
          request.accountId?.toString() === selectedAccountIdSentRequest
      );
    }
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((request) =>
        request?.zaloName?.toLowerCase().includes(searchLower)
      );
    }
    return filtered;
  }, [
    sentFriendRequests,
    filterModeSentRequest,
    selectedAccountIdSentRequest,
    searchQuery,
  ]);

  const menuItems = [
    {
      id: "friends",
      title: "Bạn bè",
      count: friends.length,
      icon: Users,
      description: "Danh sách bạn bè của bạn",
    },
    {
      id: "friend-requests",
      title: "Lời mời kết bạn",
      count: friendRequests.length,
      icon: UserPlus,
      description: "Yêu cầu kết bạn",
    },
    {
      id: "sent-friend-requests",
      title: "Lời mời đã gửi",
      count: sentFriendRequests.length,
      icon: Send,
      description: "Lời mời kết bạn đã gửi",
    },
  ];

  const getCurrentTitle = () => {
    const item = menuItems.find((item) => item.id === currentView);
    return item ? item.title : "Danh bạ";
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          {currentView !== "main" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("main")}
              className="w-8 h-8"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <h2 className="text-xl font-semibold text-gray-900">
            {getCurrentTitle()}
          </h2>
          {currentView === "main" && (
            <Button variant="ghost" size="icon" className="ml-auto w-8 h-8">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Search - only show in detail views */}
        {currentView !== "main" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-full bg-gray-100 border-gray-200 placeholder-gray-500"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentView === "main" && (
          <MainView menuItems={menuItems} setCurrentView={setCurrentView} />
        )}
        {currentView === "friends" && (
          <FriendsView
            isLoading={isLoading}
            friends={friends}
            filterMode={filterMode}
            setFilterMode={handleFilterModeChange}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={handleSelectedAccountChange}
            uniqueAccounts={uniqueAccounts}
            filteredFriends={filteredFriends}
            onSelectConversation={onSelectConversation}
            searchQuery={searchQuery}
            getAccountColor={getAccountColor}
          />
        )}
        {currentView === "friend-requests" && (
          <FriendRequestsView
            isLoadingFriendRequests={isLoadingFriendRequests}
            friendRequests={friendRequests}
            filterModeRequest={filterModeRequest}
            setFilterModeRequest={setFilterModeRequest}
            selectedAccountIdRequest={selectedAccountIdRequest}
            setSelectedAccountIdRequest={setSelectedAccountIdRequest}
            uniqueAccounts={uniqueAccounts}
            filteredFriendRequests={filteredFriendRequests}
            searchQuery={searchQuery}
            getAccountColor={getAccountColor}
          />
        )}
        {currentView === "sent-friend-requests" && (
          <SentFriendRequestsView
            isLoadingSentFriendRequests={isLoadingSentFriendRequests}
            sentFriendRequests={sentFriendRequests}
            filterModeSentRequest={filterModeSentRequest}
            setFilterModeSentRequest={setFilterModeSentRequest}
            selectedAccountIdSentRequest={selectedAccountIdSentRequest}
            setSelectedAccountIdSentRequest={setSelectedAccountIdSentRequest}
            uniqueAccounts={uniqueAccounts}
            filteredSentFriendRequests={filteredSentFriendRequests}
            searchQuery={searchQuery}
            getAccountColor={getAccountColor}
          />
        )}
      </div>
    </div>
  );
}
