import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ViewType } from "./lib";
import { FolderPlus, Upload, Search } from "lucide-react";

interface ToolbarSectionProps {
  newFolder: string;
  setNewFolder: (value: string) => void;
  onCreateFolder: () => Promise<void>;
  busy: boolean;
  onUploadToFolder: React.ChangeEventHandler<HTMLInputElement>;
  view: ViewType;
  setView: (view: ViewType) => void;
  query: string;
  setQuery: (query: string) => void;
  extensionFilter: string;
  setExtensionFilter: (filter: string) => void;
  canCreate?: boolean;
}

export function ToolbarSection({
  newFolder,
  setNewFolder,
  onCreateFolder,
  busy,
  onUploadToFolder,
  view,
  setView,
  query,
  setQuery,
  canCreate = false,
}: ToolbarSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Main toolbar */}
      <div className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Create folder and upload (hidden if no create permission) */}
          {canCreate && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1 sm:w-80">
                  <Input
                    placeholder="Tên thư mục mới"
                    value={newFolder}
                    onChange={(e) => setNewFolder(e.target.value)}
                    className="h-11 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={onCreateFolder}
                  disabled={busy || !newFolder.trim() || !canCreate}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  {busy ? "Đang tạo..." : "Tạo thư mục"}
                </Button>
              </div>

              <div className="flex items-center">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={onUploadToFolder}
                />
                <Button
                  onClick={() => fileRef.current?.click()}
                  variant="outline"
                  className="h-11 px-6 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium transition-colors duration-200"
                  disabled={!canCreate}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên file
                </Button>
              </div>
            </div>
          )}

          {/* Right: Filters and search */}
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-10 pl-4 pr-10 text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
