import React from "react";
import { UserManagementTab } from "./UserManagementTab";
import { UploadManagementHeader } from "./UploadManagementHeader";

interface UserManagementPageProps {
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
}

export function UserManagementPage({
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
}: UserManagementPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UploadManagementHeader
        onBack={onBack}
        isAdmin={isAdmin}
        onOpenChangePassword={onOpenChangePassword}
        onOpenAccounts={onOpenAccounts}
        onOpenAdminUsers={onOpenAdminUsers}
        onOpenTerritories={onOpenTerritories}
        onOpenUploads={onOpenUploads}
        onOpenUploadUsers={onOpenUploadUsers}
        onOpenUploadPermissions={onOpenUploadPermissions}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <UserManagementTab />
      </div>
    </div>
  );
}
