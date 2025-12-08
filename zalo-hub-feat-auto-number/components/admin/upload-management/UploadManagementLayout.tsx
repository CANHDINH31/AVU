import React, { useEffect, useState } from "react";
import { FolderOpen, Upload, Settings } from "lucide-react";
import { UserPermissionsTab } from "./UserPermissionsTab";
import { useUploadManagement } from "./useUploadManagement";
import { UploadManagementHeader } from "./UploadManagementHeader";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { ToolbarSection } from "./ToolbarSection";
import { FileListHeader } from "./FileListHeader";
import { FileListItem } from "./FileListItem";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { getUser } from "@/lib/auth";
import { uploadApi } from "@/lib/api/upload";

interface UploadManagementLayoutProps {
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

type TabType = "upload" | "permissions";

export function UploadManagementLayout({
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
}: UploadManagementLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [canCreate, setCanCreate] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      setCanCreate(true);
      setCanEdit(true);
      setCanDelete(true);
      return;
    }
    const u = getUser();
    const userId = Number(u?.id);
    if (!Number.isFinite(userId)) {
      setCanCreate(false);
      setCanEdit(false);
      setCanDelete(false);
      return;
    }
    Promise.all([
      uploadApi.permissions.checkPermission(userId, "canCreate"),
      uploadApi.permissions.checkPermission(userId, "canEdit"),
      uploadApi.permissions.checkPermission(userId, "canDelete"),
    ])
      .then(([c, e, d]) => {
        setCanCreate(!!c?.hasPermission);
        setCanEdit(!!e?.hasPermission);
        setCanDelete(!!d?.hasPermission);
      })
      .catch(() => {
        setCanCreate(false);
        setCanEdit(false);
        setCanDelete(false);
      });
  }, [isAdmin]);

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
    onViewChange,
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
        onOpenUploads={onOpenUploads}
        onOpenUploadUsers={onOpenUploadUsers}
        onOpenUploadPermissions={onOpenUploadPermissions}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation - only visible for admin */}
          {isAdmin && (
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
                        onClick={() => setActiveTab(tab.id)}
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
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {(activeTab === "upload" || !isAdmin) && (
              <div className="space-y-6">
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
                  canCreate={canCreate}
                />

                {/* File List */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <FileListHeader
                    sort={sort}
                    view={view}
                    onToggleNameSort={toggleNameSort}
                    onToggleTimeSort={toggleTimeSort}
                    onToggleExtensionSort={toggleExtensionSort}
                    onViewChange={onViewChange}
                  />
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <FileListItem
                        key={item.key}
                        item={item}
                        folders={folders}
                        editingFolder={editingFolder}
                        editName={editName}
                        setEditName={setEditName}
                        editingFile={editingFile}
                        editFileName={editFileName}
                        setEditFileName={setEditFileName}
                        onRenameFolder={onRenameFolder}
                        onRenameFile={onRenameFile}
                        onDeleteFile={onDeleteFile}
                        onNavigateToFolder={refresh}
                        startEditFolder={startEditFolder}
                        cancelEditFolder={cancelEditFolder}
                        startEditFile={startEditFile}
                        cancelEditFile={cancelEditFile}
                        startDeleteFolder={startDeleteFolder}
                        currentPath={listing?.path || ""}
                        canEdit={canEdit}
                        canDelete={canDelete}
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
        </div>
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
