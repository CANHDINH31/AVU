"use client";

import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

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

// Hàm tạo gradient cho account indicator - pastel nhẹ nhàng
function getAccountGradient(str: string | number) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Gradient pastel từ nhạt đến đậm hơn một chút
  return `linear-gradient(135deg, hsl(${hue}, 50%, 80%) 0%, hsl(${hue}, 65%, 70%) 100%)`;
}

// Hàm tạo shadow color cho account indicator - shadow nhẹ
function getAccountShadow(str: string | number) {
  let hash = 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  // Shadow nhẹ nhàng với màu tương ứng
  return `0 1px 4px hsla(${hue}, 60%, 60%, 0.25)`;
}

interface Account {
  id: string;
  displayName: string;
  username: string;
}

interface ChatSidebarHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterMode: "all" | "byAccount" | "strangers";
  onFilterModeChange: (value: "all" | "byAccount" | "strangers") => void;
  selectedAccountId: string;
  onSelectedAccountChange: (accountId: string) => void;
  onClearFilter: () => void;
  uniqueAccounts: Account[];
  filteredConversationsCount: number;
  hasStrangers: boolean;
}

export const ChatSidebarHeader = React.memo(
  ({
    searchQuery,
    onSearchChange,
    filterMode,
    onFilterModeChange,
    selectedAccountId,
    onSelectedAccountChange,
    onClearFilter,
    uniqueAccounts,
    filteredConversationsCount,
    hasStrangers,
  }: ChatSidebarHeaderProps) => {
    const handleFilterModeChange = useCallback(
      (value: string) => {
        onFilterModeChange(value as "all" | "byAccount" | "strangers");
      },
      [onFilterModeChange]
    );

    const handleSelectedAccountChange = useCallback(
      (accountId: string) => {
        onSelectedAccountChange(accountId);
      },
      [onSelectedAccountChange]
    );

    const handleClearFilter = useCallback(() => {
      onClearFilter();
    }, [onClearFilter]);

    return (
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tin nhắn</h2>
        </div>

        {/* Filter Tabs */}
        <div className="mb-4">
          <Tabs
            value={filterMode}
            onValueChange={handleFilterModeChange}
            className="w-full"
          >
            <TabsList
              className={`grid w-full bg-gray-100 ${
                hasStrangers ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
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
                <span className="whitespace-normal break-words">
                  Theo tài khoản
                </span>
              </TabsTrigger>
              {hasStrangers && (
                <TabsTrigger
                  value="strangers"
                  className="text-xs px-2 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900"
                >
                  Người lạ
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>

        {/* Account Selector (chỉ hiển thị khi chọn "Theo tài khoản") */}
        {filterMode === "byAccount" && (
          <div className="mb-4">
            <Select
              value={selectedAccountId}
              onValueChange={handleSelectedAccountChange}
            >
              <SelectTrigger className="bg-gray-100 border-gray-200">
                <SelectValue placeholder="Chọn tài khoản..." />
              </SelectTrigger>
              <SelectContent>
                {uniqueAccounts.map((account) => {
                  const accountColor = getAccountColor(
                    account.displayName || account.username || 0
                  );
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-xs px-2 py-0.5 h-5 font-medium"
                          style={{
                            backgroundColor: accountColor,
                            color: "#374151",
                            border: "1px solid #d1d5db",
                          }}
                        >
                          {account.displayName}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm cuộc hội thoại..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 rounded-full bg-gray-100 border-gray-200 placeholder-gray-500"
          />
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500">
            {filteredConversationsCount} cuộc trò chuyện
            {filterMode === "byAccount" && selectedAccountId && (
              <span>
                {" "}
                •{" "}
                {
                  uniqueAccounts.find((acc) => acc.id === selectedAccountId)
                    ?.displayName
                }
              </span>
            )}
            {filterMode === "strangers" && <span> • Người lạ</span>}
          </span>
          {filterMode === "byAccount" && selectedAccountId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="text-xs h-6 px-2 text-gray-500 hover:text-gray-700"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
    );
  }
);

ChatSidebarHeader.displayName = "ChatSidebarHeader";
