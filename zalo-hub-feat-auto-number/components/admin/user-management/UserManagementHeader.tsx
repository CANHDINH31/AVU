"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft, Plus, MoreVertical } from "lucide-react";
import { UserManagementProps } from "./types";
import { AdminMenu } from "@/components/ui/admin-menu";

interface UserManagementHeaderProps extends UserManagementProps {
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
  onCreateUserClick?: () => void;
}

export function UserManagementHeader({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenUploads,
  onLogout,
  onCreateUserClick,
}: UserManagementHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Quản lý người dùng
              </h1>
              <p className="text-sm text-gray-500">
                Quản lý tài khoản và quyền hạn người dùng
              </p>
            </div>
          </div>

          {/* Button thêm mới và menu cạnh nhau */}
          <div className="flex items-center space-x-2">
            {onCreateUserClick && (
              <Button onClick={onCreateUserClick}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm người dùng
              </Button>
            )}
            <AdminMenu
              isAdmin={isAdmin}
              onOpenChangePassword={onOpenChangePassword}
              onOpenAccounts={onOpenAccounts}
              onOpenAdminUsers={onOpenAdminUsers}
              onOpenTerritories={onOpenTerritories}
              onOpenUploads={onOpenUploads}
              onLogout={onLogout}
              icon={<MoreVertical className="w-4 h-4 mr-2" />}
              label="Menu"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
