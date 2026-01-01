import React, { useState } from "react";
import { FolderOpen, Upload, Settings } from "lucide-react";
import { UserPermissionsTab } from "./UserPermissionsTab";
import { UploadManagementHeader } from "./UploadManagementHeader";

interface UserPermissionsPageProps {
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenRanks?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
}

type TabType = "upload" | "permissions";

export function UserPermissionsPage({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenRanks,
  onOpenUploads,
  onLogout,
}: UserPermissionsPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>("permissions");

  const tabs = [
    {
      id: "upload" as TabType,
      label: "Upload Management",
      icon: Upload,
      description: "Quản lý file và thư mục",
    },
    ...(isAdmin
      ? [
          {
            id: "permissions" as TabType,
            label: "User Permissions",
            icon: Settings,
            description: "Phân quyền cho user",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UploadManagementHeader
        onBack={onBack}
        isAdmin={isAdmin}
        onOpenChangePassword={onOpenChangePassword}
        onOpenAccounts={onOpenAccounts}
        onOpenAdminUsers={onOpenAdminUsers}
        onOpenTerritories={onOpenTerritories}
        onOpenRanks={onOpenRanks}
        onOpenUploads={onOpenUploads}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sticky top-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 px-2">
                Quản lý Upload
              </h3>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "upload") {
                          onOpenUploads?.();
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors duration-200 ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium text-sm">{tab.label}</div>
                        <div className="text-xs opacity-75 truncate">
                          {tab.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <UserPermissionsTab />
          </div>
        </div>
      </div>
    </div>
  );
}
