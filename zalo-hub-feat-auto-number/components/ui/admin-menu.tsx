"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Key,
  Settings,
  Users,
  Shield,
  LogOut,
  MoreVertical,
  Folder,
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { uploadApi } from "@/lib/api/upload";

interface AdminMenuProps {
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onOpenUploadUsers?: () => void;
  onOpenUploadPermissions?: () => void;
  onLogout?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  icon?: React.ReactNode;
  label?: string;
}

export function AdminMenu({
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenUploads,
  onOpenUploadUsers,
  onOpenUploadPermissions,
  onLogout,
  variant = "outline",
  size = "sm",
  icon,
  label = "Menu",
}: AdminMenuProps) {
  const [hasUploadAccess, setHasUploadAccess] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setHasUploadAccess(true);
      return;
    }
    const u = getUser();
    if (!u?.id) return;
    const userId = parseInt(u.id as string, 10);
    uploadApi.permissions
      .checkPermission(userId, "canRead")
      .then((res) => setHasUploadAccess(res.hasPermission))
      .catch(() => setHasUploadAccess(false));
  }, [isAdmin]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className="outline-none ring-0 ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {icon || <MoreVertical className="w-4 h-4 mr-2" />}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onOpenChangePassword && (
          <DropdownMenuItem onClick={onOpenChangePassword}>
            <Key className="w-4 h-4 mr-2" /> Đổi mật khẩu
          </DropdownMenuItem>
        )}
        {onOpenAccounts && (
          <DropdownMenuItem onClick={onOpenAccounts}>
            <Settings className="w-4 h-4 mr-2" /> Quản lý tài khoản
          </DropdownMenuItem>
        )}
        {isAdmin && onOpenAdminUsers && (
          <DropdownMenuItem onClick={onOpenAdminUsers}>
            <Users className="w-4 h-4 mr-2" /> Quản lý người dùng
          </DropdownMenuItem>
        )}
        {isAdmin && onOpenTerritories && (
          <DropdownMenuItem onClick={onOpenTerritories}>
            <Shield className="w-4 h-4 mr-2" /> Quản lý nhóm
          </DropdownMenuItem>
        )}
        {(isAdmin || hasUploadAccess) && onOpenUploads && (
          <DropdownMenuItem onClick={onOpenUploads}>
            <Folder className="w-4 h-4 mr-2" /> Kho tài liệu chung
          </DropdownMenuItem>
        )}
        {onLogout && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
