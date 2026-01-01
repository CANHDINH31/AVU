"use client";

import React, { useCallback, useMemo, useState, useDeferredValue } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  QrCode,
  Eye,
  Trash2,
  RefreshCw,
  Search,
  MoreVertical,
  Users,
} from "lucide-react";
import { AddZaloAccountModal } from "./add-zalo-account-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountDetailModal } from "./account-detail-modal";
import { accountApi, zaloApi } from "@/lib/api";
import { Account } from "@/lib/types/account";
import { toast } from "sonner";
import { generateAvatarUrl } from "@/lib/utils/avatar";
import { AdminMenu } from "@/components/ui/admin-menu";
import { userApi, UserWithRole } from "@/lib/api/user";
import { getUser } from "@/lib/auth";
//

interface ZaloAccountManagerProps {
  onBack: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenRanks?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
}

export function ZaloAccountManager({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenRanks,
  onOpenUploads,
  onLogout,
}: ZaloAccountManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 2000);
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [userSearch, setUserSearch] = useState("");

  // Check if current user is admin or manager
  const currentUser = getUser();
  const canFilterByUser =
    currentUser?.role === "admin" || currentUser?.role === "manager";

  const queryClient = useQueryClient();
  const [loadingAccounts, setLoadingAccounts] = useState<Set<number>>(
    new Set()
  );

  const {
    data: accounts = [],
    isLoading: isLoading,
    refetch,
  } = useQuery({
    queryKey: ["currentAccount", debouncedSearchQuery, selectedUserId],
    queryFn: () =>
      accountApi.me(
        debouncedSearchQuery,
        canFilterByUser && selectedUserId !== "all"
          ? parseInt(selectedUserId)
          : undefined
      ),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Defer heavy list rendering to keep typing responsive
  const deferredAccounts = useDeferredValue(accounts);

  // Load all users once with all=1, then filter on client side
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

  // No more loading state needed since we're filtering client-side
  const isLoadingUserOptions = isLoadingAllUsers;

  const selectedUserName = useMemo(() => {
    const selected = allUsers.find((u) => u.id?.toString() === selectedUserId);
    return selected?.name;
  }, [allUsers, selectedUserId]);

  const updateAccountMutation = useMutation({
    mutationFn: (account: Account) => accountApi.update(account.id, account),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Cập nhật tài khoản thành công");
    },
    onError: (error) => {
      toast.error("Lỗi khi cập nhật tài khoản: " + error.message);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (accountId: number) => accountApi.remove(accountId),
    onSuccess: () => {
      refetch();
      toast.success("Xóa tài khoản thành công");
    },
    onError: (error) => {
      toast.error("Lỗi khi xóa tài khoản: " + error.message);
    },
  });

  const refreshAccountMutation = useMutation({
    mutationFn: (accountId: string) => zaloApi.syncFriend(accountId),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error("Lỗi khi làm mới tài khoản: " + error.message);
    },
  });

  const handleToggleStatus = useCallback(
    async (account: Account) => {
      const updatedAccount = {
        ...account,
        isActive: account.isActive === 1 ? 0 : 1,
      };
      updateAccountMutation.mutate(updatedAccount);
    },
    [updateAccountMutation]
  );

  const handleViewDetail = useCallback((account: Account) => {
    setSelectedAccount(account);
    setShowDetailModal(true);
  }, []);

  const handleDeleteAccount = useCallback(
    async (account: Account) => {
      if (
        confirm(
          `Bạn có chắc chắn muốn xóa tài khoản "${
            account.displayName ?? "Không tên"
          }"?`
        )
      ) {
        deleteAccountMutation.mutate(account.id!);
      }
    },
    [deleteAccountMutation]
  );

  const handleRefreshAccount = useCallback(
    async (account: Account) => {
      setLoadingAccounts((prev) => new Set(prev).add(account.id!));
      try {
        await refreshAccountMutation.mutateAsync(account.id!.toString());
      } finally {
        setLoadingAccounts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(account.id!);
          return newSet;
        });
      }
    },
    [refreshAccountMutation]
  );

  const handleAccountAdded = async (accountId: number) => {
    setLoadingAccounts((prev) => new Set(prev).add(accountId));
    try {
      await refreshAccountMutation.mutateAsync(accountId?.toString());
      refetch();
    } finally {
      setLoadingAccounts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Quản lý tài khoản Zalo
                </h1>
                <p className="text-sm text-gray-500">
                  {accounts.length} tài khoản
                </p>
              </div>
            </div>

            {/* Button thêm mới và menu cạnh nhau */}
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" /> Thêm tài khoản
              </Button>
              <AdminMenu
                isAdmin={isAdmin}
                onOpenChangePassword={onOpenChangePassword}
                onOpenAccounts={onOpenAccounts}
                onOpenAdminUsers={onOpenAdminUsers}
                onOpenTerritories={onOpenTerritories}
                onOpenRanks={onOpenRanks}
                onOpenUploads={onOpenUploads}
                onLogout={onLogout}
                icon={<MoreVertical className="w-4 h-4 mr-2" />}
                label="Menu"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Tìm kiếm và lọc tài khoản
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm tài khoản theo tên, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {isLoading && (
                  <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
                )}
              </div>
              {canFilterByUser && (
                <div className="w-64">
                  <Select
                    value={selectedUserId}
                    onValueChange={(val) => {
                      setSelectedUserId(val);
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
                            onChange={(e) => setUserSearch(e.target.value)}
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
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedUserId("all");
                }}
              >
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Danh sách tài khoản ({accounts.length})
                {searchQuery && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    cho "{searchQuery}"
                  </span>
                )}
                {selectedUserId !== "all" && (
                  <span className="text-sm font-normal text-blue-600 ml-2">
                    của{" "}
                    {
                      allUsers.find(
                        (u: UserWithRole) => u.id?.toString() === selectedUserId
                      )?.name
                    }
                  </span>
                )}
              </CardTitle>
              {accounts.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>
                    {accounts.filter((acc) => acc.isConnect === 1).length} đang
                    kết nối
                  </span>
                  <span>•</span>
                  <span>
                    {accounts.filter((acc) => acc.isConnect === 0).length} mất
                    kết nối
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <AccountsList
              isLoading={isLoading}
              accounts={deferredAccounts}
              searchQuery={searchQuery}
              onOpenAddModal={() => setShowAddModal(true)}
              onRefreshAccount={handleRefreshAccount}
              onToggleStatus={handleToggleStatus}
              onViewDetail={handleViewDetail}
              onDeleteAccount={handleDeleteAccount}
              loadingAccounts={loadingAccounts}
            />
          </CardContent>
        </Card>
      </div>

      <AddZaloAccountModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        refetch={refetch}
        onAccountAdded={handleAccountAdded}
      />
      <AccountDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        account={selectedAccount}
        onUpdate={(account) => {
          updateAccountMutation.mutate(account);
          setShowDetailModal(false);
        }}
        onDelete={() => {
          if (selectedAccount) {
            deleteAccountMutation.mutate(selectedAccount.id!);
            setShowDetailModal(false);
          }
        }}
      />
    </div>
  );
}

type AccountsListProps = {
  isLoading: boolean;
  accounts: Account[];
  searchQuery: string;
  onOpenAddModal: () => void;
  onRefreshAccount: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
  onViewDetail: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  loadingAccounts: Set<number>;
};

const AccountRow: React.FC<{
  account: Account;
  onRefreshAccount: (account: Account) => void;
  onToggleStatus: (account: Account) => void;
  onViewDetail: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  loadingAccounts: Set<number>;
  onOpenAddModal: () => void;
}> = React.memo(
  ({
    account,
    onRefreshAccount,
    onToggleStatus,
    onViewDetail,
    onDeleteAccount,
    loadingAccounts,
    onOpenAddModal,
  }) => {
    return (
      <div className="border rounded-lg p-4 hover:bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={generateAvatarUrl(account.zaloName, account.avatar)}
                  alt={account.displayName ?? "Avatar"}
                  className="w-12 h-12 rounded-full"
                />
              </Avatar>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  account.isConnect === 1 ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium truncate">
                  {account.displayName ?? "Không tên"}
                </h3>
                <Badge variant={account.type === 1 ? "default" : "secondary"}>
                  QR
                </Badge>
                <Badge
                  variant={account.isConnect === 1 ? "default" : "destructive"}
                >
                  {account.isConnect === 1 ? "Kết nối" : "Mất kết nối"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {account.phoneNumber ?? "Chưa có số điện thoại"}
              </p>
              {account.user && (
                <p className="text-sm text-blue-600 font-medium">
                  {account.user.name}
                </p>
              )}
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                <span>
                  Đồng bộ:{" "}
                  {new Date(account.updatedAt || Date.now()).toLocaleString(
                    "vi-VN"
                  )}
                </span>
                <span>
                  Thêm:{" "}
                  {new Date(account.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {account.isConnect === 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefreshAccount(account)}
                disabled={loadingAccounts.has(account.id!)}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> Đồng bộ
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAddModal}
                disabled={loadingAccounts.has(account.id!)}
              >
                <QrCode className="w-4 h-4 mr-2" /> Kết nối
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem onClick={() => onToggleStatus(account)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {account.isActive === 1 ? "Tạm dừng" : "Kích hoạt"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewDetail(account)}>
                  <Eye className="w-4 h-4 mr-2" /> Xem chi tiết
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => onDeleteAccount(account)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa tài khoản
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  }
);

AccountRow.displayName = "AccountRow";

const AccountsList: React.FC<AccountsListProps> = React.memo(
  ({
    isLoading,
    accounts,
    searchQuery,
    onOpenAddModal,
    onRefreshAccount,
    onToggleStatus,
    onViewDetail,
    onDeleteAccount,
    loadingAccounts,
  }) => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải...
          </h3>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      );
    }

    if (accounts.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery
              ? "Không tìm thấy tài khoản"
              : "Chưa có tài khoản Zalo"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "Thử tìm kiếm với từ khóa khác"
              : "Thêm tài khoản Zalo đầu tiên"}
          </p>
          {!searchQuery && (
            <Button onClick={onOpenAddModal}>Thêm tài khoản</Button>
          )}
        </div>
      );
    }

    const limited = accounts.slice(0, 100);
    return (
      <div className="space-y-4">
        {accounts.length > 100 && (
          <div className="text-xs text-gray-500">
            Hiển thị 100 tài khoản đầu. Hãy lọc để thu hẹp kết quả.
          </div>
        )}
        {limited.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            onRefreshAccount={onRefreshAccount}
            onToggleStatus={onToggleStatus}
            onViewDetail={onViewDetail}
            onDeleteAccount={onDeleteAccount}
            loadingAccounts={loadingAccounts}
            onOpenAddModal={onOpenAddModal}
          />
        ))}
      </div>
    );
  }
);

AccountsList.displayName = "AccountsList";
