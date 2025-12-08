import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Folder,
  Edit2,
  Trash2,
  File as FileIcon,
  Download,
} from "lucide-react";
import { FileItem, formatDate, downloadUrl, getFileExtension } from "./lib";
import { Folder as FolderType } from "@/lib/api/upload";

interface FileListItemProps {
  item: FileItem;
  folders: FolderType[];
  editingFolder: FolderType | null;
  editName: string;
  setEditName: (name: string) => void;
  editingFile: string | null;
  editFileName: string;
  setEditFileName: (name: string) => void;
  onRenameFolder: (folder: FolderType) => Promise<void>;
  onRenameFile: (oldName: string) => Promise<void>;
  onDeleteFile: (path: string, fileName: string) => Promise<void>;
  onNavigateToFolder: (path: string) => Promise<void>;
  startEditFolder: (folder: FolderType) => void;
  cancelEditFolder: () => void;
  startEditFile: (fileName: string) => void;
  cancelEditFile: () => void;
  startDeleteFolder: (folder: FolderType) => void;
  currentPath: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

// Helper function to get filename without extension
const getFileNameWithoutExtension = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1 || lastDotIndex === 0) return filename;
  return filename.substring(0, lastDotIndex);
};

export function FileListItem({
  item,
  folders,
  editingFolder,
  editName,
  setEditName,
  editingFile,
  editFileName,
  setEditFileName,
  onRenameFolder,
  onRenameFile,
  onDeleteFile,
  onNavigateToFolder,
  startEditFolder,
  cancelEditFolder,
  startEditFile,
  cancelEditFile,
  startDeleteFolder,
  currentPath,
  canEdit = false,
  canDelete = false,
}: FileListItemProps) {
  const isEditingFolder =
    editingFolder && editingFolder.path === (item as any).fullPath;
  const isEditingFile = editingFile === item.name;

  return (
    <div
      className={`grid grid-cols-12 items-center px-6 py-2 ${
        item.type === "folder" ? "hover:bg-blue-50/60" : "hover:bg-gray-50"
      }`}
    >
      {item.type === "folder" ? (
        <div className="col-span-4 flex items-center gap-2">
          <div className="w-5 h-5 rounded-sm bg-blue-100 text-blue-600 flex items-center justify-center">
            <Folder className="w-3.5 h-3.5" />
          </div>
          {isEditingFolder ? (
            <Input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRenameFolder(editingFolder);
                if (e.key === "Escape") cancelEditFolder();
              }}
              className="h-8 w-64 max-w-full"
            />
          ) : (
            <button
              className="text-left text-gray-900 hover:underline"
              onClick={async () => {
                await onNavigateToFolder((item as any).fullPath || "");
              }}
            >
              {item.name}
            </button>
          )}
        </div>
      ) : (
        <div className="col-span-4 flex items-center gap-2 text-gray-900 truncate">
          <div className="w-5 h-5 rounded-sm bg-gray-100 text-gray-600 flex items-center justify-center">
            <FileIcon className="w-3.5 h-3.5" />
          </div>
          {isEditingFile ? (
            <Input
              autoFocus
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRenameFile(item.name);
                if (e.key === "Escape") cancelEditFile();
              }}
              className="h-8 w-64 max-w-full"
            />
          ) : (
            <span className="truncate">
              {getFileNameWithoutExtension(item.name)}
            </span>
          )}
        </div>
      )}

      <div className="col-span-3 text-sm text-gray-600">
        {item.mtimeMs ? formatDate(item.mtimeMs) : ""}
      </div>

      <div className="col-span-2 text-sm text-gray-600">
        {item.type === "file" ? item.extension || "" : ""}
      </div>

      <div className="col-span-2 text-sm text-gray-600">
        {item.type === "folder" ? "File folder" : "File"}
      </div>

      <div className="col-span-1 flex items-center justify-end gap-1">
        {item.type === "folder" ? (
          <>
            {isEditingFolder ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onRenameFolder(editingFolder)}
                  className="h-7 px-2 bg-gray-900 text-white hover:bg-gray-800"
                >
                  Lưu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditFolder}
                  className="h-7 px-2"
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const f = folders.find(
                        (x) =>
                          (item as any).fullPath &&
                          x.path === (item as any).fullPath
                      );
                      if (f) startEditFolder(f);
                    }}
                    className="h-7 w-7 p-0 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    title="Đổi tên"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const f = folders.find(
                        (x) =>
                          (item as any).fullPath &&
                          x.path === (item as any).fullPath
                      );
                      if (f) startDeleteFolder(f);
                    }}
                    className="h-7 w-7 p-0 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700"
                    title="Xóa thư mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {isEditingFile ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onRenameFile(item.name)}
                  className="h-7 px-2 bg-gray-900 text-white hover:bg-gray-800"
                >
                  Lưu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditFile}
                  className="h-7 px-2"
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadUrl(item.url, item.name)}
                  className="h-7 w-7 p-0 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  title="Tải xuống"
                >
                  <Download className="w-4 h-4" />
                </Button>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditFile(item.name)}
                    className="h-7 w-7 p-0 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                    title="Đổi tên"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
                {canDelete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await onDeleteFile(currentPath, item.name);
                    }}
                    className="h-7 w-7 p-0 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700"
                    title="Xóa file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
