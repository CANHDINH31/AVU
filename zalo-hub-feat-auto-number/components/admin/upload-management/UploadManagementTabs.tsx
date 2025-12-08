import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen, Users } from "lucide-react";
import { UserPermissionsTab } from "./UserPermissionsTab";
import { useUploadManagement } from "./useUploadManagement";
import { UploadManagementHeader } from "./UploadManagementHeader";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { ToolbarSection } from "./ToolbarSection";
import { FileListHeader } from "./FileListHeader";
import { FileListItem } from "./FileListItem";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface UploadManagementTabsProps {
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
}

type TabType = "upload" | "permissions";

export function UploadManagementTabs({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenUploads,
  onLogout,
}: UploadManagementTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upload");

  const {
    // State
    newFolder,
    setNewFolder,
    busy,
    folders,
    editingFolder,
    editName,
    setEditName,
    editingFile,
    editFileName,
    setEditFileName,
    deletingFolder,
    listing,
    sort,
    query,
    setQuery,
    view,
    setView,
    extensionFilter,
    setExtensionFilter,
    breadcrumb,
    items,

    // Actions
    onCreateFolder,
    onRenameFolder,
    onRenameFile,
    onDeleteFolder,
    onDeleteFile,
    onUploadToFolder,
    refresh,
    toggleNameSort,
    toggleTimeSort,
    toggleExtensionSort,
    startEditFolder,
    cancelEditFolder,
    startEditFile,
    cancelEditFile,
    startDeleteFolder,
    cancelDeleteFolder,
  } = useUploadManagement();

  const tabs = [
    {
      id: "upload" as TabType,
      label: "Quản lý Upload",
      icon: FolderOpen,
      description: "Quản lý file và thư mục",
    },
    ...(isAdmin
      ? [
          {
            id: "permissions" as TabType,
            label: "Quản lý User",
            icon: Users,
            description: "Phân quyền cho user",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UploadManagementHeader
        onBack={onBack}
        onOpenChangePassword={onOpenChangePassword}
        onOpenAccounts={onOpenAccounts}
        onOpenAdminUsers={onOpenAdminUsers}
        onOpenTerritories={onOpenTerritories}
        onOpenUploads={onOpenUploads}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-left transition-colors duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-sm opacity-75">
                        {tab.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "upload" && (
          <div className="space-y-8">
            {/* Breadcrumb */}
            <BreadcrumbNavigation
              breadcrumb={breadcrumb}
              onNavigate={refresh}
            />

            {/* Toolbar */}
            <ToolbarSection
              newFolder={newFolder}
              setNewFolder={setNewFolder}
              onCreateFolder={onCreateFolder}
              busy={busy}
              onUploadToFolder={onUploadToFolder}
              view={view}
              setView={setView}
              query={query}
              setQuery={setQuery}
              extensionFilter={extensionFilter}
              setExtensionFilter={setExtensionFilter}
            />

            {/* File List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <FileListHeader
                sort={sort}
                onToggleNameSort={toggleNameSort}
                onToggleTimeSort={toggleTimeSort}
                onToggleExtensionSort={toggleExtensionSort}
                extensionFilter={extensionFilter}
                setExtensionFilter={setExtensionFilter}
              />
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <FileListItem
                    key={item.key}
                    item={item}
                    editingFolder={editingFolder}
                    editName={editName}
                    setEditName={setEditName}
                    editingFile={editingFile}
                    editFileName={editFileName}
                    setEditFileName={setEditFileName}
                    busy={busy}
                    onRenameFolder={onRenameFolder}
                    onRenameFile={onRenameFile}
                    onDeleteFolder={startDeleteFolder}
                    onDeleteFile={onDeleteFile}
                    onNavigate={refresh}
                    onStartEditFolder={startEditFolder}
                    onCancelEditFolder={cancelEditFolder}
                    onStartEditFile={startEditFile}
                    onCancelEditFile={cancelEditFile}
                  />
                ))}
                {items.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Không có file hoặc thư mục nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "permissions" && isAdmin && <UserPermissionsTab />}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        deletingFolder={deletingFolder}
        busy={busy}
        onCancel={cancelDeleteFolder}
        onConfirm={onDeleteFolder}
      />
    </div>
  );
}
