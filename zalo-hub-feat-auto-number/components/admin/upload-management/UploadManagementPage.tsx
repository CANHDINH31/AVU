import React from "react";
import { FolderOpen } from "lucide-react";
import { useUploadManagement } from "./useUploadManagement";
import { UploadManagementHeader } from "./UploadManagementHeader";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { ToolbarSection } from "./ToolbarSection";
import { FileListHeader } from "./FileListHeader";
import { FileListItem } from "./FileListItem";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

interface UploadManagementPageProps {
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

export function UploadManagementPage({
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
}: UploadManagementPageProps) {
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
        <div className="space-y-6">
          {/* Breadcrumb */}
          <BreadcrumbNavigation breadcrumb={breadcrumb} onNavigate={refresh} />

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
