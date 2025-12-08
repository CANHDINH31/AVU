import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  UserCheck,
  Edit,
  Trash2,
} from "lucide-react";
import {
  uploadApi,
  UploadPermissions,
  CreateUploadPermissionsRequest,
} from "@/lib/api/upload";
import { userApi, UserWithRole } from "@/lib/api/user";
import { toast } from "sonner";

export function UserPermissionsTab() {
  const [permissions, setPermissions] = useState<UploadPermissions[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newUserPermissions, setNewUserPermissions] = useState({
    canRead: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  });

  // State for user selection
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserWithRole[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State for edit modal
  const [editingPermission, setEditingPermission] =
    useState<UploadPermissions | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editPermissions, setEditPermissions] = useState({
    canRead: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  });

  const filteredPermissions = permissions.filter(
    (perm) =>
      perm.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      perm.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadPermissions = async () => {
    try {
      const data = await uploadApi.permissions.getAll();
      setPermissions(data);
    } catch (error) {
      console.error("Error loading permissions:", error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const data = await userApi.searchUsers({ search: query });
      // Filter out users who already have permissions
      const usersWithPermissions = permissions.map((p) => p.userId);
      const filteredUsers = data.filter(
        (user) => !usersWithPermissions.includes(parseInt(user.id))
      );
      setSearchResults(filteredUsers);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query);
    if (query.trim() === "") {
      setSelectedUser(null);
      setSelectedUserId("");
      setSearchResults([]);
      setShowSearchResults(false);
    } else {
      searchUsers(query);
    }
  };

  const selectUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setSelectedUserId(user.id);
    setUserSearchQuery(`${user.name} (${user.email})`);
    setShowSearchResults(false);
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".relative")) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddUserDirectly = async () => {
    if (!selectedUserId) return;

    setIsLoading(true);
    try {
      const createData: CreateUploadPermissionsRequest = {
        userId: parseInt(selectedUserId),
        ...newUserPermissions,
        // Force read permission to always be true
        canRead: true,
      };

      await uploadApi.permissions.create(createData);
      // Reset form
      setSelectedUserId("");
      setSelectedUser(null);
      setUserSearchQuery("");
      setShowSearchResults(false);
      setNewUserPermissions({
        canRead: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      });
      await loadPermissions();
      toast.success("Đã thêm quyền upload cho user thành công");
    } catch (error: any) {
      console.error("Error adding user permissions:", error);
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi thêm quyền. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa quyền của user này?")) {
      return;
    }

    setIsLoading(true);
    try {
      await uploadApi.permissions.remove(id);
      await loadPermissions();
      toast.success("Đã xóa quyền thành công");
    } catch (error: any) {
      console.error("Error removing permissions:", error);
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi xóa quyền. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (permission: UploadPermissions) => {
    setEditingPermission(permission);
    setEditPermissions({
      // Always true for read permission
      canRead: true,
      canCreate: permission.canCreate,
      canEdit: permission.canEdit,
      canDelete: permission.canDelete,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPermission) return;

    setIsLoading(true);
    try {
      await uploadApi.permissions.update(editingPermission.id, {
        ...editPermissions,
        canRead: true,
      });
      await loadPermissions();
      setIsEditModalOpen(false);
      setEditingPermission(null);
      toast.success("Đã cập nhật quyền thành công");
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast.error(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật quyền. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý User Permissions
          </h2>
        </div>
        <p className="text-gray-600">
          Quản lý quyền truy cập upload cho các user trong hệ thống
        </p>
      </div>

      {/* Add user section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Thêm User mới
          </h3>
        </div>

        <div className="space-y-4">
          {/* User selection with autocomplete */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Tìm kiếm user theo tên hoặc email..."
                value={userSearchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                className="h-11"
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchResults(true);
                  }
                }}
              />

              {/* Search results dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {user.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSearchResults &&
                searchResults.length === 0 &&
                userSearchQuery.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <span className="text-gray-500 text-sm">
                      Không tìm thấy user nào
                    </span>
                  </div>
                )}
            </div>
            <Button
              onClick={handleAddUserDirectly}
              disabled={!selectedUserId || isLoading}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {isLoading ? "Đang thêm..." : "Thêm User"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newCanRead"
                checked={newUserPermissions.canRead}
                disabled
                className="rounded w-4 h-4"
              />
              <label
                htmlFor="newCanRead"
                className="text-sm font-medium text-gray-700"
              >
                Quyền xem
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newCanCreate"
                checked={newUserPermissions.canCreate}
                onChange={(e) =>
                  setNewUserPermissions((prev) => ({
                    ...prev,
                    canCreate: e.target.checked,
                  }))
                }
                className="rounded w-4 h-4"
              />
              <label
                htmlFor="newCanCreate"
                className="text-sm font-medium text-gray-700"
              >
                Quyền tạo
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newCanEdit"
                checked={newUserPermissions.canEdit}
                onChange={(e) =>
                  setNewUserPermissions((prev) => ({
                    ...prev,
                    canEdit: e.target.checked,
                  }))
                }
                className="rounded w-4 h-4"
              />
              <label
                htmlFor="newCanEdit"
                className="text-sm font-medium text-gray-700"
              >
                Quyền sửa
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newCanDelete"
                checked={newUserPermissions.canDelete}
                onChange={(e) =>
                  setNewUserPermissions((prev) => ({
                    ...prev,
                    canDelete: e.target.checked,
                  }))
                }
                className="rounded w-4 h-4"
              />
              <label
                htmlFor="newCanDelete"
                className="text-sm font-medium text-gray-700"
              >
                Quyền xóa
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm user theo email hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {/* Permissions list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            Danh sách User ({filteredPermissions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPermissions.map((perm) => (
            <div
              key={perm.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900 text-lg">
                  {perm.user.name}
                  <span className="text-sm text-gray-500">
                    ({perm.user.email})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(perm)}
                    disabled={isLoading}
                    className="h-9 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveUser(perm.id)}
                    disabled={isLoading}
                    className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredPermissions.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Không tìm thấy user nào</p>
              <p className="text-sm mt-2">Thử thay đổi từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Permissions Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Chỉnh sửa quyền - {editingPermission?.user.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editCanRead"
                  checked={editPermissions.canRead}
                  disabled
                  className="rounded w-4 h-4"
                />
                <label
                  htmlFor="editCanRead"
                  className="text-sm font-medium text-gray-700"
                >
                  Quyền xem
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editCanCreate"
                  checked={editPermissions.canCreate}
                  onChange={(e) =>
                    setEditPermissions((prev) => ({
                      ...prev,
                      canCreate: e.target.checked,
                    }))
                  }
                  className="rounded w-4 h-4"
                />
                <label
                  htmlFor="editCanCreate"
                  className="text-sm font-medium text-gray-700"
                >
                  Quyền tạo
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editCanEdit"
                  checked={editPermissions.canEdit}
                  onChange={(e) =>
                    setEditPermissions((prev) => ({
                      ...prev,
                      canEdit: e.target.checked,
                    }))
                  }
                  className="rounded w-4 h-4"
                />
                <label
                  htmlFor="editCanEdit"
                  className="text-sm font-medium text-gray-700"
                >
                  Quyền sửa
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editCanDelete"
                  checked={editPermissions.canDelete}
                  onChange={(e) =>
                    setEditPermissions((prev) => ({
                      ...prev,
                      canDelete: e.target.checked,
                    }))
                  }
                  className="rounded w-4 h-4"
                />
                <label
                  htmlFor="editCanDelete"
                  className="text-sm font-medium text-gray-700"
                >
                  Quyền xóa
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
