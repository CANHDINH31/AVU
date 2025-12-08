import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Folder,
  FolderOpen,
  Search,
  Loader2,
  Grid3X3,
  List,
  ArrowLeft,
  Home,
  FileSearch,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadApi, type Folder as UploadFolder } from "@/lib/api/upload";
import type { SharedFolder } from "@/lib/api/shared-folder";

interface SharedFolderPickerProps {
  onSelectFolder?: (folder: SharedFolder) => void;
  onToggleSelect?: (folder: SharedFolder) => void;
  selectedIds?: string[];
  accountId: number;
  children: React.ReactNode;
}

export function SharedFolderPicker({
  onSelectFolder,
  onToggleSelect,
  selectedIds,
  accountId,
  children,
}: SharedFolderPickerProps) {
  const [folders, setFolders] = useState<SharedFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [currentPath, setCurrentPath] = useState<string>("");
  const [breadcrumb, setBreadcrumb] = useState<
    Array<{ name: string; path: string }>
  >([{ name: "uploads", path: "" }]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [dbFolders, setDbFolders] = useState<UploadFolder[]>([]);

  useEffect(() => {
    // Load both DB folders (for display names) and the listing
    void (async () => {
      try {
        const all = await uploadApi.getFolders();
        setDbFolders(all || []);
        // Load folders with current path after dbFolders is set
        await loadFoldersWithDbFolders(currentPath, all || []);
      } catch (e) {
        setDbFolders([]);
        loadFoldersWithDbFolders("", []);
      }
    })();
  }, [accountId]);

  // Update breadcrumb when dbFolders changes to use correct display names
  useEffect(() => {
    if (dbFolders.length > 0) {
      setBreadcrumb([
        { name: "uploads", path: "" },
        ...buildCrumbs(currentPath),
      ]);
    }
  }, [dbFolders, currentPath]);

  const loadFoldersWithDbFolders = async (
    path: string,
    dbFoldersData: UploadFolder[]
  ) => {
    setLoading(true);
    try {
      const data = await uploadApi.list(path);
      const mapped: SharedFolder[] = [
        // Map folders first (use DB display name when available)
        ...(data.folders || []).map((filesystemName) => {
          const fullPath = data.path
            ? `${data.path}/${filesystemName}`
            : filesystemName;
          const db = dbFoldersData.find((f) => f.path === fullPath);
          const displayName = db ? db.name : filesystemName;
          return {
            id: `folder:${fullPath}`,
            name: displayName,
            path: fullPath,
            type: "folder" as const,
          };
        }),
        // Map files
        ...(data.files || []).map((f) => ({
          id: `file:${f.url}`,
          name: f.name,
          path: f.url,
          type: "file" as const,
          size: f.size,
        })),
      ];
      setFolders(mapped);
      setCurrentPath(path);
    } catch (error) {
      console.error("Error loading uploads list:", error);
      setCurrentPath("");
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async (path: string) => {
    await loadFoldersWithDbFolders(path, dbFolders);
  };

  const buildCrumbs = (path: string) => {
    const parts = (path || "").split("/").filter(Boolean);
    const crumbs: Array<{ name: string; path: string }> = [];
    let acc = "";
    for (const p of parts) {
      acc = acc ? `${acc}/${p}` : p;
      // Use DB folder display name when available
      const db = dbFolders.find((f) => f.path === acc);
      crumbs.push({ name: db ? db.name : p, path: acc });
    }
    return crumbs;
  };

  const navigateToFolder = async (folder: SharedFolder) => {
    if (folder.type === "folder") {
      const nextPath = folder.path;
      await loadFolders(nextPath);
    } else {
      // Toggle selection for files via parent callback
      onToggleSelect?.(folder);
      onSelectFolder?.(folder);
    }
  };

  const navigateBack = async () => {
    if (breadcrumb.length > 1) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      const parentPath = newBreadcrumb[newBreadcrumb.length - 1]?.path || "";
      await loadFolders(parentPath);
    }
  };

  const navigateToRoot = () => {
    loadFolders("");
  };

  const navigateToBreadcrumb = async (index: number) => {
    const targetBreadcrumb = breadcrumb[index];
    if (targetBreadcrumb) {
      await loadFolders(targetBreadcrumb.path);
    }
  };

  const renderFolderItem = (folder: SharedFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const isFile = folder.type === "file";
    const isSelected = isFile && (selectedIds || []).includes(folder.id);

    // Filter children based on search term
    const filteredChildren = folder.children?.filter(
      (child) =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.path.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div key={folder.id}>
        <div
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border ${
            isSelected
              ? "bg-blue-50 border-blue-200 text-blue-700"
              : "border-gray-100 " +
                (isFile ? "text-blue-600" : "text-gray-700")
          }`}
          onClick={() => navigateToFolder(folder)}
        >
          <div className="flex-shrink-0">
            {isFile ? (
              <Folder className="w-5 h-5 text-blue-500" />
            ) : (
              <FolderOpen className="w-5 h-5 text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">
                {folder.name}
              </span>
              {folder.type === "file" && folder.size && (
                <span className="text-xs text-gray-500">
                  ({`${(folder.size / 1024).toFixed(1)} KB`})
                </span>
              )}
              {isSelected && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  Đã chọn
                </span>
              )}
            </div>
            {/* Hide path, only show name */}
          </div>

          {isFile && (
            <div className="flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  if (folder.path) {
                    window.open(folder.path, "_blank", "noopener,noreferrer");
                  }
                }}
                title="Preview"
              >
                <FileSearch className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      folder.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.children &&
        folder.children.some(
          (child) =>
            child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            child.path.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-[600px] p-0 rounded-xl shadow-lg border-0"
        align="start"
      >
        <div className="bg-white rounded-xl">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-800">
                  Thư mục dùng chung
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setViewMode(viewMode === "list" ? "grid" : "list")
                  }
                  className="h-8 w-8 p-0"
                >
                  {viewMode === "list" ? (
                    <Grid3X3 className="w-4 h-4" />
                  ) : (
                    <List className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateToRoot}
                  className="h-6 px-2 text-xs"
                >
                  <Home className="w-3 h-3 mr-1" />
                </Button>
                {breadcrumb.map((item, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <span className="text-gray-400">/</span>
                    <button
                      onClick={() => navigateToBreadcrumb(index)}
                      className="text-gray-600 hover:text-blue-600 hover:underline transition-colors"
                    >
                      {item.name}
                    </button>
                  </div>
                ))}
              </div>
              {breadcrumb.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateBack}
                  className="h-6 px-2 text-xs"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Quay lại
                </Button>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm thư mục và file..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="h-80">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500">Đang tải...</span>
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>
                  {searchTerm
                    ? "Không tìm thấy thư mục nào"
                    : "Không có thư mục dùng chung"}
                </p>
              </div>
            ) : (
              <div className="p-4">
                {viewMode === "list" ? (
                  <div className="space-y-1">
                    {filteredFolders.map((folder) => renderFolderItem(folder))}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3">
                    {filteredFolders.map((folder) => (
                      <div
                        key={folder.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => navigateToFolder(folder)}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-10 h-10 mb-2 flex items-center justify-center">
                            {folder.type === "file" ? (
                              <Folder className="w-6 h-6 text-blue-500" />
                            ) : (
                              <FolderOpen className="w-6 h-6 text-gray-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900 truncate w-full">
                            {folder.name}
                          </span>
                          {folder.type === "file" && folder.size && (
                            <span className="text-xs text-gray-500 truncate w-full">
                              {`${(folder.size / 1024).toFixed(1)} KB`}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
