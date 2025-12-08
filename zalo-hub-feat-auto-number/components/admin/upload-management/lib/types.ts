export interface FileItem {
  key: string;
  name: string;
  type: "folder" | "file";
  mtimeMs: number;
  size?: number;
  url?: string;
  fullPath?: string;
  extension?: string;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface ListingData {
  path: string;
  folders: string[];
  foldersDetailed?: { name: string; mtimeMs: number }[];
  files: { name: string; url: string; size: number; mtimeMs: number }[];
}

export type SortType =
  | "none"
  | "az"
  | "za"
  | "time_desc"
  | "time_asc"
  | "ext_asc"
  | "ext_desc";
export type ViewType = "all" | "folders" | "files";
