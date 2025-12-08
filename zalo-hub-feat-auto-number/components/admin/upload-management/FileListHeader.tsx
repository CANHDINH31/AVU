import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDown01,
  ArrowUp10,
  ArrowUpDown,
  ChevronDown,
} from "lucide-react";
import { SortType, ViewType } from "./lib";

interface FileListHeaderProps {
  sort: SortType;
  view: ViewType;
  onToggleNameSort: () => void;
  onToggleTimeSort: () => void;
  onToggleExtensionSort: () => void;
  onViewChange: (view: ViewType) => void;
}

const SortIcon = ({
  active,
  dir,
  type,
}: {
  active: boolean;
  dir: "asc" | "desc";
  type: "name" | "time";
}) => {
  const cls = `w-4 h-4 ml-1 ${active ? "text-gray-900" : "text-gray-300"}`;
  if (!active) return <ArrowUpDown className={cls} />;
  if (type === "name") {
    return dir === "asc" ? (
      <ArrowUpAZ className={cls} />
    ) : (
      <ArrowDownAZ className={cls} />
    );
  }
  // time
  return dir === "asc" ? (
    <ArrowUp10 className={cls} />
  ) : (
    <ArrowDown01 className={cls} />
  );
};

export function FileListHeader({
  sort,
  view,
  onToggleNameSort,
  onToggleTimeSort,
  onToggleExtensionSort,
  onViewChange,
}: FileListHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getViewLabel = (viewType: ViewType) => {
    switch (viewType) {
      case "all":
        return "Tất cả";
      case "folders":
        return "Chỉ thư mục";
      case "files":
        return "Chỉ file";
      default:
        return "Tất cả";
    }
  };

  const handleViewSelect = (selectedView: ViewType) => {
    onViewChange(selectedView);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-sm text-gray-600 grid grid-cols-12">
      <button
        type="button"
        onClick={onToggleNameSort}
        className="col-span-4 flex items-center text-left hover:text-gray-900"
      >
        Name
        <SortIcon
          active={sort === "az" || sort === "za"}
          dir={sort === "za" ? "desc" : "asc"}
          type="name"
        />
      </button>
      <button
        type="button"
        onClick={onToggleTimeSort}
        className="col-span-3 flex items-center text-left hover:text-gray-900"
      >
        Date modified
        <SortIcon
          active={sort === "time_asc" || sort === "time_desc"}
          dir={sort === "time_asc" ? "asc" : "desc"}
          type="time"
        />
      </button>
      <button
        type="button"
        onClick={onToggleExtensionSort}
        className="col-span-2 flex items-center text-left hover:text-gray-900"
      >
        Extension
        <SortIcon
          active={sort === "ext_asc" || sort === "ext_desc"}
          dir={sort === "ext_desc" ? "desc" : "asc"}
          type="name"
        />
      </button>
      <div className="col-span-2 relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center text-left hover:text-gray-900"
        >
          Type
          <ChevronDown
            className={`w-4 h-4 ml-1 text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="py-1">
              <button
                onClick={() => handleViewSelect("all")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  view === "all" ? "bg-blue-50 text-blue-700" : "text-gray-700"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => handleViewSelect("folders")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  view === "folders"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                Chỉ thư mục
              </button>
              <button
                onClick={() => handleViewSelect("files")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                  view === "files"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700"
                }`}
              >
                Chỉ file
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="col-span-1 text-right">Actions</div>
    </div>
  );
}
