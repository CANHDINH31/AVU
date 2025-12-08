"use client";

import React from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Folder, ArrowLeft, MoreVertical } from "lucide-react";
import { AdminMenu } from "@/components/ui/admin-menu";

interface UploadManagementHeaderProps {
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onOpenUploadUsers?: () => void;
  onOpenUploadPermissions?: () => void;
  onLogout?: () => void;
  rightActions?: ReactNode;
}

export function UploadManagementHeader({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenUploads,
  onOpenUploadUsers,
  onOpenUploadPermissions,
  onLogout,
  rightActions,
}: UploadManagementHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            )}
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Kho tài liệu chung
              </h1>
              <p className="text-sm text-gray-500">
                Tạo thư mục, tải file và lấy liên kết
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {rightActions}
            <AdminMenu
              isAdmin={isAdmin}
              onOpenChangePassword={onOpenChangePassword}
              onOpenAccounts={onOpenAccounts}
              onOpenAdminUsers={onOpenAdminUsers}
              onOpenTerritories={onOpenTerritories}
              onOpenUploads={onOpenUploads}
              onOpenUploadUsers={onOpenUploadUsers}
              onOpenUploadPermissions={onOpenUploadPermissions}
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
