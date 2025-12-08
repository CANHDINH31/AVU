import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { Friend } from "@/lib/types/friend";

interface AccountType {
  id: string;
  displayName: string;
  username: string;
}

type FriendsViewProps = {
  isLoading: boolean;
  friends: Friend[];
  filterMode: "all" | "byAccount";
  setFilterMode: (mode: "all" | "byAccount") => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  uniqueAccounts: AccountType[];
  filteredFriends: Friend[];
  onSelectConversation: (conversationId: string) => void;
  searchQuery: string;
  getAccountColor: (str: string | number) => string;
};

export const FriendsView: React.FC<FriendsViewProps> = ({
  isLoading,
  filterMode,
  setFilterMode,
  selectedAccountId,
  setSelectedAccountId,
  uniqueAccounts,
  filteredFriends,
  onSelectConversation,
  getAccountColor,
}) => {
  const handleFriendClick = async (friend: Friend) => {
    onSelectConversation(friend.id.toString());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-500">Đang tải danh sách bạn bè...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Filter Tabs */}
      <div className="mb-4">
        <Tabs
          value={filterMode}
          onValueChange={(v) => setFilterMode(v as "all" | "byAccount")}
          className="w-full"
        >
          <TabsList className="grid w-full bg-gray-100 grid-cols-2">
            <TabsTrigger
              value="all"
              className="text-xs px-2 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger
              value="byAccount"
              className="text-xs px-1 py-2 leading-tight data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Theo tài khoản
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Account Selector (chỉ hiển thị khi chọn "Theo tài khoản") */}
      {filterMode === "byAccount" && (
        <div className="mb-4">
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="bg-gray-100 border-gray-200">
              <SelectValue placeholder="Chọn tài khoản..." />
            </SelectTrigger>
            <SelectContent>
              {uniqueAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {/* Danh sách bạn bè đã lọc */}
      {filteredFriends.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Không có bạn bè phù hợp.
        </div>
      ) : (
        filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            onClick={() => handleFriendClick(friend)}
          >
            <div className="relative">
              <Avatar className="w-14 h-14">
                <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {friend?.zaloName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-900">{friend.zaloName}</h3>
              {friend.account?.displayName && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 h-5 font-medium mt-1"
                  style={{
                    backgroundColor: getAccountColor(
                      friend.account.displayName
                    ),
                    color: "#374151",
                    border: "1px solid #d1d5db",
                  }}
                >
                  {friend.account.displayName}
                </Badge>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
