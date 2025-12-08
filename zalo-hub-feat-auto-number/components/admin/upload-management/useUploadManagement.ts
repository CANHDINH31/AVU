import { useEffect, useMemo, useState } from "react";
import { uploadApi, Folder as FolderType } from "@/lib/api/upload";
import {
  FileItem,
  BreadcrumbItem,
  ListingData,
  SortType,
  ViewType,
  slugify,
  getFileExtension,
  getFileName,
} from "./lib";

export function useUploadManagement() {
  const [newFolder, setNewFolder] = useState("");
  const [busy, setBusy] = useState(false);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);
  const [editName, setEditName] = useState("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState("");
  const [deletingFolder, setDeletingFolder] = useState<FolderType | null>(null);
  const [listing, setListing] = useState<ListingData | null>(null);
  const [sort, setSort] = useState<SortType>("none");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewType>("all");
  const [extensionFilter, setExtensionFilter] = useState("");

  const refresh = async (path: string) => {
    // Only send backend-supported sort types
    const backendSort =
      sort === "none" || sort === "ext_asc" || sort === "ext_desc"
        ? "az"
        : sort;
    const data = await uploadApi.list(path, {
      sort: backendSort,
      q: query || undefined,
    });

    setListing(data);
  };

  const loadFolders = async () => {
    const data = await uploadApi.getFolders();
    setFolders(data);
  };

  useEffect(() => {
    refresh("");
    loadFolders();
  }, []);

  // Re-fetch when sort or query changes
  useEffect(() => {
    const t = setTimeout(() => {
      refresh(listing?.path || "");
    }, 300);
    return () => clearTimeout(t);
  }, [sort, query, extensionFilter]);

  const breadcrumb = useMemo(() => {
    const parts = (listing?.path || "").split("/").filter(Boolean);
    const crumbs: BreadcrumbItem[] = [{ name: "uploads", path: "" }];
    let acc = "";
    for (const p of parts) {
      acc = acc ? `${acc}/${p}` : p;
      const displayName = folders.find((f) => f.path === acc)?.name || p;
      crumbs.push({ name: displayName, path: acc });
    }
    return crumbs;
  }, [listing?.path, folders]);

  // Helper functions for duplicate checking
  const checkFolderNameExists = (name: string): boolean => {
    if (!listing?.folders) return false;
    const slug = slugify(name);
    return listing.folders.includes(slug);
  };

  const checkFileNameExists = (name: string): boolean => {
    if (!listing?.files) return false;
    return listing.files.some((file) => file.name === name);
  };

  const items = useMemo(() => {
    if (!listing) return [] as FileItem[];

    const folderItems = (listing.folders || []).map((filesystemName) => {
      const fullPath = listing.path
        ? `${listing.path}/${filesystemName}`
        : filesystemName;
      const m =
        listing?.foldersDetailed?.find?.((f) => f.name === filesystemName)
          ?.mtimeMs || 0;

      // Find the database folder info to get the display name
      const dbFolder = folders.find((f) => f.path === fullPath);
      const displayName = dbFolder ? dbFolder.name : filesystemName;

      return {
        key: `folder:${fullPath}`,
        name: displayName,
        type: "folder" as const,
        mtimeMs: m,
        size: 0,
        fullPath,
      };
    });

    const fileItems = (listing.files || []).map((f) => {
      const fileName = getFileName(f.name);
      return {
        key: `file:${f.url}`,
        name: fileName,
        type: "file" as const,
        mtimeMs: f.mtimeMs,
        size: f.size,
        url: f.url,
        extension: getFileExtension(fileName),
      };
    });

    let all = [...folderItems, ...fileItems];
    if (view === "folders") all = all.filter((i) => i.type === "folder");
    if (view === "files") all = all.filter((i) => i.type === "file");

    // Filter by extension
    if (extensionFilter.trim()) {
      const filterExt = extensionFilter.trim().toLowerCase();
      all = all.filter((i) => {
        if (i.type === "folder") return true; // Always show folders
        return ((i as any).extension || "").toLowerCase().includes(filterExt);
      });
    }

    if (sort === "az" || sort === "za") {
      all.sort((a, b) =>
        sort === "az"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
    } else if (sort === "time_asc" || sort === "time_desc") {
      all.sort((a, b) =>
        sort === "time_asc" ? a.mtimeMs - b.mtimeMs : b.mtimeMs - a.mtimeMs
      );
    } else if (sort === "ext_asc" || sort === "ext_desc") {
      all.sort((a, b) => {
        // For folders, put them at the end when sorting by extension
        if (a.type === "folder" && b.type === "file") return 1;
        if (a.type === "file" && b.type === "folder") return -1;
        if (a.type === "folder" && b.type === "folder") return 0;

        const aExt = (a as any).extension || "";
        const bExt = (b as any).extension || "";
        return sort === "ext_asc"
          ? aExt.localeCompare(bExt)
          : bExt.localeCompare(aExt);
      });
    }
    // If sort === "none", don't sort (keep original order)

    return all;
  }, [listing, sort, view, folders, extensionFilter]);

  const onCreateFolder = async () => {
    if (!newFolder.trim()) return;

    // Check for duplicate folder name
    if (checkFolderNameExists(newFolder.trim())) {
      alert(
        `Thư mục "${newFolder.trim()}" đã tồn tại. Vui lòng chọn tên khác.`
      );
      return;
    }

    setBusy(true);
    try {
      const slug = slugify(newFolder.trim());
      const finalPath = (listing?.path ? `${listing.path}/` : "") + slug;
      await uploadApi.createFolder(newFolder.trim(), finalPath);
      setNewFolder("");
      await loadFolders();
      await refresh(listing?.path || "");
    } catch (error: any) {
      console.error("Error creating folder:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi tạo thư mục. Vui lòng thử lại."
      );
    } finally {
      setBusy(false);
    }
  };

  const onRenameFolder = async (folder: FolderType) => {
    if (!editName.trim()) return;

    // Don't check if the name is the same as current
    if (editName.trim() === folder.name) {
      setEditingFolder(null);
      setEditName("");
      return;
    }

    // Check for duplicate folder name
    if (checkFolderNameExists(editName.trim())) {
      alert(`Thư mục "${editName.trim()}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }

    setBusy(true);
    try {
      await uploadApi.renameFolder(folder.id, editName.trim());
      setEditingFolder(null);
      setEditName("");
      await loadFolders();
      await refresh(listing?.path || "");
    } catch (error: any) {
      console.error("Error renaming folder:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi đổi tên thư mục. Vui lòng thử lại."
      );
    } finally {
      setBusy(false);
    }
  };

  const onRenameFile = async (oldName: string) => {
    if (!editFileName.trim()) return;

    // Get extension from old name
    const lastDotIndex = oldName.lastIndexOf(".");
    const extension =
      lastDotIndex === -1 || lastDotIndex === 0
        ? ""
        : oldName.substring(lastDotIndex);

    // Create new name with extension
    const newName = editFileName.trim() + extension;

    if (newName === oldName) {
      setEditingFile(null);
      setEditFileName("");
      return;
    }

    // Check for duplicate file name
    if (checkFileNameExists(newName)) {
      alert(`File "${newName}" đã tồn tại. Vui lòng chọn tên khác.`);
      return;
    }

    setBusy(true);
    try {
      await uploadApi.renameFile(listing?.path || "", oldName, newName);
      setEditingFile(null);
      setEditFileName("");
      await refresh(listing?.path || "");
    } catch (error: any) {
      console.error("Error renaming file:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi đổi tên file. Vui lòng thử lại."
      );
    } finally {
      setBusy(false);
    }
  };

  const onDeleteFolder = async (folder: FolderType) => {
    setBusy(true);
    try {
      await uploadApi.deleteFolder(folder.id);
      setDeletingFolder(null);
      await loadFolders();
      await refresh(listing?.path || "");
    } finally {
      setBusy(false);
    }
  };

  const onDeleteFile = async (path: string, fileName: string) => {
    await uploadApi.deleteFile(path, fileName);
    await refresh(listing?.path || "");
  };

  const onUploadToFolder: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    const target = listing?.path || "";

    // Check for duplicate file names
    const duplicateFiles: string[] = [];
    files.forEach((file) => {
      if (checkFileNameExists(file.name)) {
        duplicateFiles.push(file.name);
      }
    });

    if (duplicateFiles.length > 0) {
      alert(
        `Các file sau đã tồn tại: ${duplicateFiles.join(
          ", "
        )}\nVui lòng đổi tên file hoặc chọn file khác.`
      );
      e.target.value = "";
      return;
    }

    setBusy(true);
    try {
      await uploadApi.uploadFilesToFolder(target, files);
      await refresh(target);
    } catch (error: any) {
      console.error("Error uploading files:", error);
      alert(
        error?.response?.data?.message ||
          "Có lỗi xảy ra khi tải lên file. Vui lòng thử lại."
      );
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const toggleNameSort = () => {
    setSort((prev) => {
      if (prev === "none") return "az";
      if (prev === "az") return "za";
      return "none";
    });
  };

  const toggleTimeSort = () => {
    setSort((prev) => {
      if (
        prev === "none" ||
        prev === "az" ||
        prev === "za" ||
        prev === "ext_asc" ||
        prev === "ext_desc"
      )
        return "time_desc";
      if (prev === "time_desc") return "time_asc";
      return "none";
    });
  };

  const toggleExtensionSort = () => {
    setSort((prev) => {
      if (
        prev === "none" ||
        prev === "az" ||
        prev === "za" ||
        prev === "time_asc" ||
        prev === "time_desc"
      )
        return "ext_asc";
      if (prev === "ext_asc") return "ext_desc";
      return "none";
    });
  };

  const onViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const startEditFolder = (folder: FolderType) => {
    setEditingFolder(folder);
    setEditName(folder.name);
  };

  const cancelEditFolder = () => {
    setEditingFolder(null);
    setEditName("");
  };

  const startEditFile = (oldName: string) => {
    setEditingFile(oldName);
    // Only edit the name without extension
    const lastDotIndex = oldName.lastIndexOf(".");
    const nameWithoutExt =
      lastDotIndex === -1 || lastDotIndex === 0
        ? oldName
        : oldName.substring(0, lastDotIndex);
    setEditFileName(nameWithoutExt);
  };

  const cancelEditFile = () => {
    setEditingFile(null);
    setEditFileName("");
  };

  const startDeleteFolder = (folder: FolderType) => {
    setDeletingFolder(folder);
  };

  const cancelDeleteFolder = () => {
    setDeletingFolder(null);
  };

  return {
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
  };
}
