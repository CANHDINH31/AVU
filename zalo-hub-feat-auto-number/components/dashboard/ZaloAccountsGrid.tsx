"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, QrCode, Play, RefreshCw, Search, Send } from "lucide-react";
import { generateAvatarUrl } from "@/lib/utils/avatar";
import { UserWithRole } from "@/lib/api/user";
import { getUser } from "@/lib/auth";
import { toast } from "sonner";

interface ZaloAccountItem {
  id?: string | number;
  zaloName?: string;
  displayName?: string;
  avatar?: string;
  phoneNumber?: string;
  updatedAt?: string | Date;
  type?: number;
  isConnect?: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ZaloAccountsGridProps {
  zaloAccounts: ZaloAccountItem[];
  isLoading: boolean;
  selectedAccounts: string[];
  onToggleAccount: (accountId: string) => void;
  onStartChat: () => void;
  onOpenAccounts: () => void;
  canFilterByUser?: boolean;
  selectedUserId?: string;
  onSelectedUserIdChange?: (userId: string) => void;
  userSearch?: string;
  onUserSearchChange?: (search: string) => void;
  displayedUsers?: UserWithRole[];
  isLoadingUserOptions?: boolean;
  allUsers?: UserWithRole[];
}

const getStatusColor = (isConnect?: number) => {
  switch (isConnect) {
    case 1:
      return "bg-green-500";
    case 0:
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

const getStatusText = (isConnect?: number) => {
  switch (isConnect) {
    case 1:
      return "Đang kết nối";
    case 0:
      return "Mất kết nối";
    default:
      return "Không xác định";
  }
};

export function ZaloAccountsGrid({
  zaloAccounts,
  isLoading,
  selectedAccounts,
  onToggleAccount,
  onStartChat,
  onOpenAccounts,
  canFilterByUser = false,
  selectedUserId = "all",
  onSelectedUserIdChange,
  userSearch = "",
  onUserSearchChange,
  displayedUsers = [],
  isLoadingUserOptions = false,
  allUsers = [],
}: ZaloAccountsGridProps) {
  const router = useRouter();

  const handleOpenAccounts = () => {
    const user = getUser();

    // Admin can add unlimited accounts
    if (user?.role === "admin") {
      onOpenAccounts();
      return;
    }

    // Check if user has rank
    if (!user?.rank) {
      toast.error("Bạn chưa có rank. Vui lòng liên hệ admin để được gán rank.");
      return;
    }

    // Check account limit
    const currentAccountCount = zaloAccounts.length;
    const maxAccounts = user.rank.maxAccounts;

    if (currentAccountCount >= maxAccounts) {
      toast.error(
        `Bạn đã đạt đến giới hạn số tài khoản cho rank ${user.rank.displayName} (${maxAccounts} tài khoản). Vui lòng nâng cấp rank để thêm nhiều tài khoản hơn.`
      );
      return;
    }

    // If not at limit, open the modal
    onOpenAccounts();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Tài khoản Zalo ({zaloAccounts.length})</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push("/phone-numbers")}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Send className="w-4 h-4 mr-2" />
              Spam tin nhắn
            </Button>
            {selectedAccounts.length > 0 && (
              <Button
                onClick={onStartChat}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Bắt đầu chat ({selectedAccounts.length})
              </Button>
            )}
          </div>
        </div>

        {/* User Filter */}
        {canFilterByUser && (
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-64">
                <Select
                  value={selectedUserId}
                  onValueChange={(val) => {
                    onSelectedUserIdChange?.(val);
                  }}
                >
                  <SelectTrigger
                    className={
                      selectedUserId !== "all"
                        ? "border-blue-500 bg-blue-50"
                        : ""
                    }
                  >
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Lọc theo người dùng" />
                  </SelectTrigger>
                  <SelectContent className="p-0 overflow-hidden max-h-80">
                    <div className="sticky top-0 z-10 bg-white px-2 pb-2 pt-2 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <Input
                          value={userSearch}
                          onChange={(e) => onUserSearchChange?.(e.target.value)}
                          placeholder="Tìm người dùng..."
                          className="pl-7 h-8 text-sm"
                        />
                        {isLoadingUserOptions && (
                          <RefreshCw className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      <SelectItem value="all" className="py-2">
                        <div className="flex items-center">
                          Tất cả người dùng
                        </div>
                      </SelectItem>

                      {/* Loading skeletons while loading all users initially */}
                      {isLoadingUserOptions && (
                        <div className="px-3 py-2 space-y-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-4 bg-gray-100 rounded animate-pulse"
                            />
                          ))}
                        </div>
                      )}

                      {!isLoadingUserOptions &&
                        displayedUsers.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id.toString()}
                            className="py-2"
                          >
                            <div className="flex items-center">
                              {user.name} ({user.email})
                            </div>
                          </SelectItem>
                        ))}

                      {!isLoadingUserOptions &&
                        userSearch.trim().length >= 1 &&
                        displayedUsers.length === 0 && (
                          <div className="px-3 py-3 text-sm text-gray-500">
                            Không tìm thấy người dùng phù hợp
                          </div>
                        )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-3 w-28" />
              </div>
            ))}
          </div>
        ) : zaloAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có tài khoản Zalo
            </h3>
            <p className="text-gray-500 mb-4">
              Thêm tài khoản Zalo đầu tiên để bắt đầu
            </p>
            <Button onClick={handleOpenAccounts}>Thêm tài khoản Zalo</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zaloAccounts.map((account) => (
              <div
                key={account.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAccounts.includes(account.id?.toString() || "")
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onToggleAccount(account.id?.toString() || "")}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={generateAvatarUrl(
                          account.zaloName,
                          account.avatar
                        )}
                      />
                      <AvatarFallback>
                        {(account.displayName || "A")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                        account.isConnect
                      )} rounded-full border-2 border-white`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {account.displayName || "Không tên"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {account.phoneNumber || "Chưa có số điện thoại"}
                    </p>
                    {account.user && (
                      <p className="text-sm text-blue-600 font-medium">
                        {account.user.name}
                      </p>
                    )}
                  </div>
                  {selectedAccounts.includes(account.id?.toString() || "") && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <Badge variant={account.type === 1 ? "default" : "secondary"}>
                    <>
                      <QrCode className="w-3 h-3 mr-1" />
                      QR
                    </>
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        account.isConnect === 1 ? "default" : "secondary"
                      }
                    >
                      {getStatusText(account.isConnect)}
                    </Badge>
                    {account.isConnect === 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 hover:bg-red-50 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAccounts();
                        }}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <p>
                    Đồng bộ:{" "}
                    {account.updatedAt
                      ? new Date(account.updatedAt).toLocaleDateString()
                      : "Chưa đồng bộ"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
