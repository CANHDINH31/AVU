import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  UserMinus,
  Mail,
  Search,
  Check,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import {
  uploadApi,
  UploadPermissions,
  InviteUserRequest,
} from "@/lib/api/upload";

export function UserManagementTab() {
  const [permissions, setPermissions] = useState<UploadPermissions[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newUserPermissions, setNewUserPermissions] = useState({
    canRead: true,
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

  useEffect(() => {
    loadPermissions();
  }, []);

  const handleInviteUser = async () => {
    if (!newUserEmail.trim()) return;

    setIsLoading(true);
    try {
      const inviteData: InviteUserRequest = {
        email: newUserEmail.trim(),
        ...newUserPermissions,
      };

      await uploadApi.permissions.inviteUser(inviteData);
      setNewUserEmail("");
      setNewUserPermissions({
        canRead: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      });
      await loadPermissions();
      alert(`Đã mời user ${newUserEmail.trim()} thành công`);
    } catch (error: any) {
      console.error("Error inviting user:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi mời user. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermissions = async (
    id: number,
    updates: Partial<UploadPermissions>
  ) => {
    setIsLoading(true);
    try {
      await uploadApi.permissions.update(id, updates);
      await loadPermissions();
      alert("Đã cập nhật quyền thành công");
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi cập nhật quyền. Vui lòng thử lại."
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
      alert("Đã xóa quyền thành công");
    } catch (error: any) {
      console.error("Error removing permissions:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi xóa quyền. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (
    id: number,
    permission: keyof UploadPermissions
  ) => {
    const currentPerm = permissions.find((p) => p.id === id);
    if (currentPerm) {
      const updates = {
        [permission]: !currentPerm[permission],
      };
      handleUpdatePermissions(id, updates);
    }
  };

  const getPermissionBadgeColor = (hasPermission: boolean) => {
    return hasPermission
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <Check className="w-3 h-3 mr-1" />
    ) : (
      <X className="w-3 h-3 mr-1" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Quản lý User Upload
          </h2>
        </div>
        <p className="text-gray-600">
          Quản lý quyền truy cập upload cho các user trong hệ thống
        </p>
      </div>

      {/* Invite new user section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Mời User mới
        </h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Email của user"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <Button
              onClick={handleInviteUser}
              disabled={!newUserEmail.trim() || isLoading}
              className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? "Đang mời..." : "Mời User"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="newCanRead"
                checked={newUserPermissions.canRead}
                onChange={(e) =>
                  setNewUserPermissions((prev) => ({
                    ...prev,
                    canRead: e.target.checked,
                  }))
                }
                className="rounded w-4 h-4"
              />
              <label
                htmlFor="newCanRead"
                className="text-sm font-medium text-gray-700"
              >
                Quyền đọc
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

      {/* Users list */}
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
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {perm.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-lg">
                      {perm.user.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {perm.user.email}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Thêm vào:{" "}
                      {new Date(perm.createdAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Permission badges */}
                  <div className="flex items-center gap-2">
                    <Badge className={getPermissionBadgeColor(perm.canRead)}>
                      {getPermissionIcon(perm.canRead)}
                      Đọc
                    </Badge>

                    <Badge className={getPermissionBadgeColor(perm.canCreate)}>
                      {getPermissionIcon(perm.canCreate)}
                      Tạo
                    </Badge>

                    <Badge className={getPermissionBadgeColor(perm.canEdit)}>
                      {getPermissionIcon(perm.canEdit)}
                      Sửa
                    </Badge>

                    <Badge className={getPermissionBadgeColor(perm.canDelete)}>
                      {getPermissionIcon(perm.canDelete)}
                      Xóa
                    </Badge>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePermission(perm.id, "canRead")}
                      disabled={isLoading}
                      className={`h-9 px-3 ${
                        perm.canRead
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Đọc
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePermission(perm.id, "canCreate")}
                      disabled={isLoading}
                      className={`h-9 px-3 ${
                        perm.canCreate
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Tạo
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePermission(perm.id, "canEdit")}
                      disabled={isLoading}
                      className={`h-9 px-3 ${
                        perm.canEdit
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Sửa
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePermission(perm.id, "canDelete")}
                      disabled={isLoading}
                      className={`h-9 px-3 ${
                        perm.canDelete
                          ? "bg-green-50 border-green-300 text-green-700"
                          : "bg-gray-50 border-gray-300 text-gray-700"
                      }`}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveUser(perm.id)}
                      disabled={isLoading}
                      className="h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
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
    </div>
  );
}
