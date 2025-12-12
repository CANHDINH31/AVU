"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { AdminMenu } from "@/components/ui/admin-menu";

interface DashboardHeaderProps {
  userName: string;
  isAdmin: boolean;
  onOpenAccounts: () => void;
  onOpenAdminUsers: () => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
  onOpenTerritories: () => void;
  onOpenUploads: () => void;
}

export function DashboardHeader({
  userName,
  isAdmin,
  onOpenAccounts,
  onOpenAdminUsers,
  onLogout,
  onOpenChangePassword,
  onOpenTerritories,
  onOpenUploads,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">QĐ Zalo</h1>
              <p className="text-sm text-gray-500">Xin chào, {userName}</p>
            </div>
          </div>

          <AdminMenu
            isAdmin={isAdmin}
            onOpenAccounts={onOpenAccounts}
            onOpenAdminUsers={onOpenAdminUsers}
            onLogout={onLogout}
            onOpenChangePassword={onOpenChangePassword}
            onOpenTerritories={onOpenTerritories}
            onOpenUploads={onOpenUploads}
            variant="outline"
            size="default"
            label="Menu"
          />
        </div>
      </div>
    </div>
  );
}
