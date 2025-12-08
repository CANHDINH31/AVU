import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Folder as FolderType } from "@/lib/api/upload";

interface DeleteConfirmationModalProps {
  deletingFolder: FolderType | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (folder: FolderType) => Promise<void>;
}

export function DeleteConfirmationModal({
  deletingFolder,
  busy,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  if (!deletingFolder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Xóa thư mục</h3>
            <p className="text-sm text-gray-500">
              Thao tác này không thể hoàn tác
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Bạn có chắc chắn muốn xóa thư mục{" "}
            <strong>"{deletingFolder.name}"</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              ⚠️ Thao tác này sẽ xóa hết tất cả:
            </p>
            <ul className="text-sm text-red-600 mt-1 ml-4">
              <li>• Subfolders bên trong</li>
              <li>• Tất cả files</li>
              <li>• Không thể hoàn tác</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={busy}
            className="px-4"
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={() => onConfirm(deletingFolder)}
            disabled={busy}
            className="px-4 bg-red-600 hover:bg-red-700"
          >
            {busy ? "Đang xóa..." : "Xóa thư mục"}
          </Button>
        </div>
      </div>
    </div>
  );
}
