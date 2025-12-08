"use client";

import React from "react";
import { UploadManagementLayout } from "./UploadManagementLayout";

interface UploadManagementProps {
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

export function UploadManagement({
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
}: UploadManagementProps) {
  return (
    <UploadManagementLayout
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
  );
}
