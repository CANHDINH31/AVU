"use client";

import { useState, useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Phone, UserPlus, Loader2 } from "lucide-react";
import { Friend } from "@/lib/types/friend";
import { zaloApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PhoneNumbersSidebarProps {
  friends: Friend[];
  selectedAccounts: string[];
  isLoading: boolean;
}

interface PhoneNumberItem {
  phoneNumber: string;
  name: string;
  userId: string;
  friendId: number;
  accountId: number;
  avatar?: string;
  zaloName?: string;
  displayName?: string;
  isFriend: boolean;
  accountDisplayName?: string;
}

function getAccountColor(str: string | number) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 75%)`;
}

export function PhoneNumbersSidebar({
  friends,
  selectedAccounts,
  isLoading,
}: PhoneNumbersSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [isSendingRequests, setIsSendingRequests] = useState(false);
  const [filterMode, setFilterMode] = useState<"all" | "non-friends">("all");
  const { toast } = useToast();

  // Transform friends data to phone number items
  const phoneNumberItems = useMemo(() => {
    const phoneMap = new Map<string, PhoneNumberItem>();

    friends.forEach((friend) => {
      if (friend.phoneNumber && friend.phoneNumber.trim()) {
        const phone = friend.phoneNumber.trim();
        const existing = phoneMap.get(phone);

        if (!existing) {
          phoneMap.set(phone, {
            phoneNumber: phone,
            name:
              friend.zaloName ||
              friend.displayName ||
              friend.username ||
              "Không tên",
            userId: friend.userId,
            friendId: friend.id,
            accountId: friend.accountId,
            avatar: friend.avatar,
            zaloName: friend.zaloName,
            displayName: friend.displayName,
            isFriend: friend.isFr === 1,
            accountDisplayName:
              friend.account?.displayName ||
              friend.account?.zaloName ||
              "Unknown Account",
          });
        } else {
          // If phone number exists, combine account info
          if (friend.isFr === 1) {
            existing.isFriend = true;
          }
        }
      }
    });

    return Array.from(phoneMap.values());
  }, [friends]);

  // Filter phone numbers
  const filteredPhoneNumbers = useMemo(() => {
    let filtered = phoneNumberItems;

    // Filter by friend status
    if (filterMode === "non-friends") {
      filtered = filtered.filter((item) => !item.isFriend);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.phoneNumber.includes(searchQuery) ||
          item.name.toLowerCase().includes(searchLower) ||
          item.zaloName?.toLowerCase().includes(searchLower) ||
          item.displayName?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [phoneNumberItems, filterMode, searchQuery]);

  // Get non-friend phone numbers
  const nonFriendPhones = useMemo(
    () => filteredPhoneNumbers.filter((item) => !item.isFriend),
    [filteredPhoneNumbers]
  );

  const handleSelectPhone = useCallback((phoneNumber: string) => {
    setSelectedPhones((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(phoneNumber)) {
        newSet.delete(phoneNumber);
      } else {
        newSet.add(phoneNumber);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedPhones.size === nonFriendPhones.length) {
      setSelectedPhones(new Set());
    } else {
      setSelectedPhones(
        new Set(nonFriendPhones.map((item) => item.phoneNumber))
      );
    }
  }, [nonFriendPhones, selectedPhones.size]);

  const handleBulkSendFriendRequest = useCallback(async () => {
    if (selectedPhones.size === 0) {
      toast({
        title: "Chưa chọn số điện thoại",
        description:
          "Vui lòng chọn ít nhất một số điện thoại để gửi lời mời kết bạn",
        variant: "destructive",
      });
      return;
    }

    const selectedItems = filteredPhoneNumbers.filter(
      (item) => selectedPhones.has(item.phoneNumber) && !item.isFriend
    );

    if (selectedItems.length === 0) {
      toast({
        title: "Không có số điện thoại hợp lệ",
        description: "Tất cả số điện thoại đã chọn đã là bạn bè",
        variant: "destructive",
      });
      return;
    }

    setIsSendingRequests(true);

    try {
      let successCount = 0;
      let errorCount = 0;

      // Group by accountId to send requests
      const requestsByAccount = new Map<number, PhoneNumberItem[]>();
      selectedItems.forEach((item) => {
        if (!requestsByAccount.has(item.accountId)) {
          requestsByAccount.set(item.accountId, []);
        }
        requestsByAccount.get(item.accountId)!.push(item);
      });

      // Send friend requests for each account
      for (const [accountId, items] of requestsByAccount.entries()) {
        for (const item of items) {
          try {
            await zaloApi.sendFriendRequest({
              accountId,
              userId: item.userId,
              friendId: item.friendId,
            });
            successCount++;
          } catch (error: any) {
            console.error(
              `Failed to send friend request to ${item.phoneNumber}:`,
              error
            );
            errorCount++;
          }
        }
      }

      toast({
        title: "Gửi lời mời kết bạn",
        description: `Thành công: ${successCount}, Thất bại: ${errorCount}`,
      });

      // Clear selection after sending
      setSelectedPhones(new Set());
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi lời mời kết bạn",
        variant: "destructive",
      });
    } finally {
      setIsSendingRequests(false);
    }
  }, [selectedPhones, filteredPhoneNumbers, toast]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Phone className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý số điện thoại
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm số điện thoại, tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-full bg-gray-100 border-gray-200 placeholder-gray-500"
          />
        </div>

        {/* Filter and Bulk Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant={filterMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
            >
              Tất cả ({phoneNumberItems.length})
            </Button>
            <Button
              variant={filterMode === "non-friends" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterMode("non-friends")}
            >
              Chưa kết bạn (
              {phoneNumberItems.filter((item) => !item.isFriend).length})
            </Button>
          </div>

          {filterMode === "non-friends" && nonFriendPhones.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isSendingRequests}
              >
                {selectedPhones.size === nonFriendPhones.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
              <Button
                size="sm"
                onClick={handleBulkSendFriendRequest}
                disabled={
                  isSendingRequests ||
                  selectedPhones.size === 0 ||
                  filteredPhoneNumbers.filter(
                    (item) =>
                      selectedPhones.has(item.phoneNumber) && !item.isFriend
                  ).length === 0
                }
              >
                {isSendingRequests ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Gửi lời mời ({selectedPhones.size})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filteredPhoneNumbers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Phone className="w-12 h-12 mb-4 text-gray-300" />
            <p className="text-sm">
              {searchQuery
                ? "Không tìm thấy số điện thoại nào"
                : "Chưa có số điện thoại nào"}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {filteredPhoneNumbers.map((item) => {
              const isSelected = selectedPhones.has(item.phoneNumber);
              const canSelect = !item.isFriend && filterMode === "non-friends";

              return (
                <div
                  key={`${item.phoneNumber}-${item.accountId}`}
                  className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                    isSelected ? "bg-blue-50 border-blue-300" : ""
                  }`}
                >
                  {canSelect && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() =>
                        handleSelectPhone(item.phoneNumber)
                      }
                    />
                  )}

                  {/* Avatar */}
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{
                        backgroundColor: getAccountColor(item.accountId),
                      }}
                    >
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.isFriend && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Đã kết bạn
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {item.phoneNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="px-2 py-0.5 text-xs rounded-full text-white"
                        style={{
                          backgroundColor: getAccountColor(item.accountId),
                        }}
                      >
                        {item.accountDisplayName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
