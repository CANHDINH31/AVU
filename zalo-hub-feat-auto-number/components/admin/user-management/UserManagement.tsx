"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus } from "lucide-react";
import { userApi, UserWithRole } from "@/lib/api/user";
import { UserManagementProps, NewUser } from "./types";
import { UserManagementHeader } from "./UserManagementHeader";
import { UserStats } from "./UserStats";
import { UserSearchFilters } from "./UserSearchFilters";
import { UserTable } from "./UserTable";
import { CreateUserDialog } from "./CreateUserDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";
import { toast } from "sonner";
import { ActionButton } from "@/components/ui/action-button";

export function UserManagement({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenRanks,
  onOpenUploads,
  onLogout,
}: UserManagementProps) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<number | undefined>(
    undefined
  );
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [rankFilter, setRankFilter] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [selectedUserIdForPasswordChange, setSelectedUserIdForPasswordChange] =
    useState<string>("");
  const [newUser, setNewUser] = useState<NewUser>({
    email: "",
    name: "",
    password: "",
    role: "user",
  });

  // Fetch users with pagination
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "admin-users",
      currentPage,
      pageSize,
      searchTerm,
      activeFilter,
      roleFilter,
      rankFilter,
    ],
    queryFn: () =>
      userApi.getAllUsers({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        active: activeFilter,
        role: roleFilter,
        rankId: rankFilter,
      }),
  });

  // Fetch user statistics
  const { data: usersStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["users-stats"],
    queryFn: userApi.getAllUsersStats,
  });

  const users = usersData?.data || [];
  const totalPages = usersData?.totalPages || 0;
  const total = usersData?.total || 0;

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      setIsCreateDialogOpen(false);
      setNewUser({ email: "", name: "", password: "", role: "user" });
      toast.success("Tạo người dùng thành công!");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Tạo người dùng thất bại");
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      userApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success("Cập nhật vai trò thành công !");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Cập nhật vài trò thất bại !");
    },
  });

  // Update user rank mutation
  const updateRankMutation = useMutation({
    mutationFn: ({ id, rankId }: { id: string; rankId: number }) =>
      userApi.updateUserRank(id, rankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success("Cập nhật rank thành công !");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Cập nhật rank thất bại !");
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      toast.success("Xóa người dùng thành công !");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xóa người dùng thất bại !");
    },
  });

  // Activate user mutation
  const activateMutation = useMutation({
    mutationFn: userApi.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      toast.success("Kích hoạt người dùng thành công !");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Kích hoạt người dùng thất bại !");
    },
  });

  // Deactivate user mutation
  const deactivateMutation = useMutation({
    mutationFn: userApi.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users-stats"] });
      toast.success("Vô hiệu hóa người dùng thành công !");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Vô hiệu hóa người dùng thất bại !");
    },
  });

  // Handle search with debounce
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle active filter change
  const handleActiveFilterChange = (value?: number) => {
    setActiveFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle role filter change
  const handleRoleFilterChange = (value?: string) => {
    setRoleFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle rank filter change
  const handleRankFilterChange = (value?: number) => {
    setRankFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast.error("Vui lòng điền đầy đủ thông tin !");

      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleUpdateRole = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleUpdateRank = (userId: string, rankId: number) => {
    updateRankMutation.mutate({ id: userId, rankId });
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleEditUser = (user: UserWithRole | null) => {
    setSelectedUser(user);
    setIsEditDialogOpen(!!user);
  };

  const handleActivateUser = (userId: string) => {
    activateMutation.mutate(userId);
  };

  const handleDeactivateUser = (userId: string) => {
    deactivateMutation.mutate(userId);
  };

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => userApi.changePassword(userId, newPassword),
    onSuccess: () => {
      setIsChangePasswordDialogOpen(false);
      setSelectedUserIdForPasswordChange("");
      toast.success("Đổi mật khẩu thành công !");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Đổi mật khẩu thất bại !");
    },
  });

  const handleChangePassword = (userId: string, newPassword: string) => {
    changePasswordMutation.mutate({ userId, newPassword });
  };

  const handleOpenChangePasswordDialog = (userId: string) => {
    setSelectedUserIdForPasswordChange(userId);
    setIsChangePasswordDialogOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải danh sách người dùng. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserManagementHeader
        onBack={onBack}
        isAdmin={isAdmin}
        onOpenChangePassword={onOpenChangePassword}
        onOpenAccounts={onOpenAccounts}
        onOpenAdminUsers={onOpenAdminUsers}
        onOpenTerritories={onOpenTerritories}
        onOpenRanks={onOpenRanks}
        onOpenUploads={onOpenUploads}
        onLogout={onLogout}
        onCreateUserClick={() => setIsCreateDialogOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserSearchFilters
          searchTerm={searchTerm}
          pageSize={pageSize}
          activeFilter={activeFilter}
          roleFilter={roleFilter}
          rankFilter={rankFilter}
          onSearchChange={handleSearch}
          onPageSizeChange={handlePageSizeChange}
          onActiveFilterChange={handleActiveFilterChange}
          onRoleFilterChange={handleRoleFilterChange}
          onRankFilterChange={handleRankFilterChange}
        />

        <UserStats
          usersStats={
            usersStats || {
              totalUsers: 0,
              adminCount: 0,
              managerCount: 0,
              userCount: 0,
              activeCount: 0,
            }
          }
          isLoading={isStatsLoading}
        />

        <UserTable
          users={users}
          isLoading={isLoading}
          total={total}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          onActivate={handleActivateUser}
          onDeactivate={handleDeactivateUser}
          onChangePassword={handleOpenChangePasswordDialog}
          onUpdateRole={handleUpdateRole}
          onUpdateRank={handleUpdateRank}
          isEditDialogOpen={isEditDialogOpen}
          selectedUser={selectedUser}
          updateRoleMutation={updateRoleMutation}
          updateRankMutation={updateRankMutation}
          deleteUserMutation={deleteUserMutation}
          activateMutation={activateMutation}
          deactivateMutation={deactivateMutation}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        newUser={newUser}
        onNewUserChange={setNewUser}
        onCreateUser={handleCreateUser}
        createUserMutation={createUserMutation}
      />

      <ChangePasswordDialog
        isOpen={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
        userId={selectedUserIdForPasswordChange}
        onChangePassword={handleChangePassword}
        changePasswordMutation={changePasswordMutation}
      />
    </div>
  );
}
