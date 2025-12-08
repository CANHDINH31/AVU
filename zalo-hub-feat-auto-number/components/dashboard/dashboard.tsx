"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, Users, Settings, AlertTriangle } from "lucide-react";
import { accountApi } from "@/lib/api";
import { userApi, UserWithRole } from "@/lib/api/user";
import { useChatContext } from "@/lib/contexts/chat-context";
import { getUser } from "@/lib/auth";
import { ChangeMyPasswordDialog } from "./ChangeMyPasswordDialog";
import { DashboardHeader } from "./DashboardHeader";
import { ZaloAccountsGrid } from "./ZaloAccountsGrid";
import { toast } from "sonner";

interface DashboardProps {
  user: any;
  onLogout: () => void;
  onViewChange: (view: "dashboard" | "accounts" | "chat") => void;
  onStartMultiChat: (accountIds: string[]) => void;
}

export function Dashboard({
  user,
  onLogout,
  onViewChange,
  onStartMultiChat,
}: DashboardProps) {
  const router = useRouter();
  const { selectedAccounts, setSelectedAccounts, isInitialized } =
    useChatContext();
  const [removedAccounts, setRemovedAccounts] = useState<string[]>([]);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [userSearch, setUserSearch] = useState("");

  // Check if current user is admin
  const currentUser = getUser();
  const isAdmin = currentUser?.role === "admin";
  const canFilterByUser =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const { data: zaloAccounts = [], isLoading } = useQuery({
    queryKey: ["accounts", selectedUserId],
    queryFn: () =>
      accountApi.me(
        undefined,
        canFilterByUser && selectedUserId !== "all"
          ? parseInt(selectedUserId)
          : undefined
      ),
  });

  // Load all users for filtering
  const { data: allUsers = [], isLoading: isLoadingAllUsers } = useQuery<
    UserWithRole[]
  >({
    queryKey: ["allUsers"],
    queryFn: () => userApi.searchUsers({ all: 1 }),
    enabled: canFilterByUser,
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 10 * 60_000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Client-side filtering of users based on search input
  const displayedUsers: UserWithRole[] = useMemo(() => {
    if (!userSearch.trim()) return allUsers;

    const searchLower = userSearch.toLowerCase().trim();
    return allUsers.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }, [userSearch, allUsers]);

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!currentUser?.id) throw new Error("Không xác định người dùng");
      return userApi.changeMyPassword(
        currentUser.id,
        currentPassword,
        newPassword
      );
    },
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
      setIsChangePasswordOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Đổi mật khẩu thất bại");
    },
  });

  // Tự động loại bỏ những tài khoản đã chọn nhưng không còn tồn tại (không phải mất kết nối)
  useEffect(() => {
    if (
      isInitialized &&
      zaloAccounts.length > 0 &&
      selectedAccounts.length > 0
    ) {
      // Chỉ loại bỏ tài khoản không tồn tại trong danh sách, không loại bỏ tài khoản mất kết nối
      const existingAccountIds = zaloAccounts.map(
        (acc) => acc.id?.toString() || ""
      );

      const nonExistentAccounts = selectedAccounts.filter(
        (accountId) => !existingAccountIds.includes(accountId)
      );

      if (nonExistentAccounts.length > 0) {
        const newSelectedAccounts = selectedAccounts.filter((accountId) =>
          existingAccountIds.includes(accountId)
        );
        setSelectedAccounts(newSelectedAccounts);
        setRemovedAccounts(nonExistentAccounts);

        // Xóa thông báo sau 5 giây
        setTimeout(() => setRemovedAccounts([]), 5000);
      }
    }
  }, [zaloAccounts, selectedAccounts, isInitialized, setSelectedAccounts]);

  const handleAccountToggle = (accountId: string) => {
    const newSelectedAccounts = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter((id: string) => id !== accountId)
      : [...selectedAccounts, accountId];
    setSelectedAccounts(newSelectedAccounts);
  };

  const handleStartChat = () => {
    if (selectedAccounts.length > 0) {
      // Kiểm tra xem có tài khoản mất kết nối nào được chọn không
      const disconnectedSelectedAccounts = zaloAccounts
        .filter(
          (acc) =>
            selectedAccounts.includes(acc.id?.toString() || "") &&
            acc.isConnect === 0
        )
        .map((acc) => acc.displayName || acc.zaloName || "Không tên");

      if (disconnectedSelectedAccounts.length > 0) {
        const confirmMessage = `Có ${
          disconnectedSelectedAccounts.length
        } tài khoản mất kết nối: ${disconnectedSelectedAccounts.join(
          ", "
        )}. Bạn có muốn tiếp tục không?`;
        if (window.confirm(confirmMessage)) {
          onStartMultiChat(selectedAccounts);
        }
      } else {
        onStartMultiChat(selectedAccounts);
      }
    }
  };

  const disconnectedAccounts = zaloAccounts.filter(
    (acc) => acc.isConnect === 0
  );
  const hasDisconnectedAccounts = disconnectedAccounts.length > 0;

  // Hiển thị loading khi context chưa được khởi tạo
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader
        userName={user.name}
        isAdmin={isAdmin}
        onOpenAccounts={() => onViewChange("accounts")}
        onOpenAdminUsers={() => router.push("/admin/users")}
        onLogout={onLogout}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenTerritories={() => router.push("/admin/territories")}
        onOpenUploads={() => router.push("/admin/uploads")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChangeMyPasswordDialog
          isOpen={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
          userId={currentUser?.id || ""}
          isSubmitting={changePasswordMutation.isPending}
          onSubmit={async ({ currentPassword, newPassword }) => {
            await changePasswordMutation.mutateAsync({
              currentPassword,
              newPassword,
            });
          }}
        />

        {/* Removed Accounts Alert */}
        {removedAccounts.length > 0 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Thông báo:</strong> {removedAccounts.length} tài khoản đã
              được tự động loại bỏ khỏi danh sách chat vì không còn tồn tại
              trong hệ thống.
            </AlertDescription>
          </Alert>
        )}

        {/* Disconnected Selected Accounts Warning */}
        {selectedAccounts.length > 0 &&
          (() => {
            const disconnectedSelectedAccounts = zaloAccounts.filter(
              (acc) =>
                selectedAccounts.includes(acc.id?.toString() || "") &&
                acc.isConnect === 0
            );

            if (disconnectedSelectedAccounts.length > 0) {
              return (
                <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Cảnh báo:</strong> Có{" "}
                    {disconnectedSelectedAccounts.length} tài khoản mất kết nối
                    trong danh sách chat:{" "}
                    {disconnectedSelectedAccounts
                      .map(
                        (acc) => acc.displayName || acc.zaloName || "Không tên"
                      )
                      .join(", ")}
                    . Bạn vẫn có thể vào chat để xem lịch sử hội thoại, nhưng
                    không thể gửi tin nhắn mới.
                  </AlertDescription>
                </Alert>
              );
            }
            return null;
          })()}

        {/* Success Alert when all accounts are connected */}
        {!isLoading && zaloAccounts.length > 0 && !hasDisconnectedAccounts && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 flex items-center justify-between">
              <span>
                <strong>Tuyệt vời!</strong> Tất cả tài khoản đều đang kết nối.
                Bạn có thể bắt đầu sử dụng tính năng chat ngay bây giờ.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tài khoản Zalo
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {zaloAccounts.length}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Đang kết nối
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {zaloAccounts.filter((acc) => acc.isConnect === 1).length}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Settings className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Mất kết nối
                  </p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {zaloAccounts.filter((acc) => acc.isConnect === 0).length}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ZaloAccountsGrid
          zaloAccounts={zaloAccounts as any}
          isLoading={isLoading}
          selectedAccounts={selectedAccounts}
          onToggleAccount={handleAccountToggle}
          onStartChat={handleStartChat}
          onOpenAccounts={() => onViewChange("accounts")}
          canFilterByUser={canFilterByUser}
          selectedUserId={selectedUserId}
          onSelectedUserIdChange={setSelectedUserId}
          userSearch={userSearch}
          onUserSearchChange={setUserSearch}
          displayedUsers={displayedUsers}
          isLoadingUserOptions={isLoadingAllUsers}
          allUsers={allUsers}
        />
      </div>
    </div>
  );
}
