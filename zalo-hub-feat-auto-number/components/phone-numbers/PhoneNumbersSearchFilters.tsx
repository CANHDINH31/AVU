"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, XCircle, Filter, ChevronDown, ChevronUp } from "lucide-react";

export type FriendFilterOption = "all" | "friend" | "notFriend";
export type FriendRequestFilterOption = "all" | "sent" | "notSent";
export type ScanStatusOption = "all" | "scanned" | "notScanned";
export type ScanSortOrder = "asc" | "desc";
export type HasScanInfoFilterOption = "all" | "hasInfo" | "noInfo";
export type MessageFilterOption = "all" | "hasMessage" | "noMessage";
export type LastMessageStatusFilterOption =
  | "all"
  | "success"
  | "messageBlocked"
  | "strangerBlocked"
  | "noMsgId";

interface PhoneNumbersSearchFiltersProps {
  searchTerm: string;
  friendFilter: FriendFilterOption;
  friendRequestFilter: FriendRequestFilterOption;
  scanStatus: ScanStatusOption;
  scanSortOrder: ScanSortOrder;
  scannedFrom: string;
  scannedTo: string;
  createdFrom: string;
  createdTo: string;
  minScanCount: string;
  maxScanCount: string;
  hasScanInfoFilter: HasScanInfoFilterOption;
  hasMessageFilter: MessageFilterOption;
  lastMessageFrom: string;
  lastMessageTo: string;
  lastMessageStatusFilter: LastMessageStatusFilterOption;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFriendFilterChange: (value: FriendFilterOption) => void;
  onFriendRequestFilterChange: (value: FriendRequestFilterOption) => void;
  onScanStatusChange: (value: ScanStatusOption) => void;
  onScanSortOrderChange: (value: ScanSortOrder) => void;
  onScannedFromChange: (value: string) => void;
  onScannedToChange: (value: string) => void;
  onCreatedFromChange: (value: string) => void;
  onCreatedToChange: (value: string) => void;
  onMinScanCountChange: (value: string) => void;
  onMaxScanCountChange: (value: string) => void;
  onHasScanInfoFilterChange: (value: HasScanInfoFilterOption) => void;
  onHasMessageFilterChange: (value: MessageFilterOption) => void;
  onLastMessageFromChange: (value: string) => void;
  onLastMessageToChange: (value: string) => void;
  onLastMessageStatusFilterChange: (
    value: LastMessageStatusFilterOption
  ) => void;
  onClearFilters: () => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export function PhoneNumbersSearchFilters({
  searchTerm,
  friendFilter,
  friendRequestFilter,
  scanStatus,
  scanSortOrder,
  scannedFrom,
  scannedTo,
  createdFrom,
  createdTo,
  minScanCount,
  maxScanCount,
  hasScanInfoFilter,
  hasMessageFilter,
  lastMessageFrom,
  lastMessageTo,
  lastMessageStatusFilter,
  onSearchInputChange,
  onSearchSubmit,
  onFriendFilterChange,
  onFriendRequestFilterChange,
  onScanStatusChange,
  onScanSortOrderChange,
  onScannedFromChange,
  onScannedToChange,
  onCreatedFromChange,
  onCreatedToChange,
  onMinScanCountChange,
  onMaxScanCountChange,
  onHasScanInfoFilterChange,
  onHasMessageFilterChange,
  onLastMessageFromChange,
  onLastMessageToChange,
  onLastMessageStatusFilterChange,
  onClearFilters,
  isCollapsed,
  onToggleCollapsed,
}: PhoneNumbersSearchFiltersProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchSubmit();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm số điện thoại, tên, ghi chú..."
            value={searchTerm}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto lg:pl-4">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onToggleCollapsed}
          >
            <Filter className="w-4 h-4" />
            {isCollapsed ? "Mở bộ lọc" : "Thu gọn"}
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-gray-600"
            onClick={onClearFilters}
          >
            <XCircle className="w-4 h-4" />
            Xóa lọc
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSearchSubmit}
            className="gap-2"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm
          </Button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterField
            label="Bạn bè"
            value={friendFilter}
            onChange={(value) =>
              onFriendFilterChange(value as FriendFilterOption)
            }
            options={[
              { value: "all", label: "Tất cả" },
              { value: "friend", label: "Chỉ bạn bè" },
              { value: "notFriend", label: "Chưa là bạn" },
            ]}
          />
          <FilterField
            label="Trạng thái lời mời"
            value={friendRequestFilter}
            onChange={(value) =>
              onFriendRequestFilterChange(value as FriendRequestFilterOption)
            }
            options={[
              { value: "all", label: "Tất cả" },
              { value: "sent", label: "Đã gửi" },
              { value: "notSent", label: "Chưa gửi" },
            ]}
          />
          <FilterField
            label="Trạng thái quét"
            value={scanStatus}
            onChange={(value) => onScanStatusChange(value as ScanStatusOption)}
            options={[
              { value: "all", label: "Tất cả" },
              { value: "scanned", label: "Đã quét" },
              { value: "notScanned", label: "Chưa quét" },
            ]}
          />
          <FilterField
            label="Thứ tự lần quét"
            value={scanSortOrder}
            onChange={(value) => onScanSortOrderChange(value as ScanSortOrder)}
            options={[
              { value: "desc", label: "Mới quét gần đây" },
              { value: "asc", label: "Quét lâu nhất" },
            ]}
          />
          <FilterField
            label="Trạng thái có dữ liệu quét"
            value={hasScanInfoFilter}
            onChange={(value) =>
              onHasScanInfoFilterChange(value as HasScanInfoFilterOption)
            }
            options={[
              { value: "all", label: "Tất cả" },
              { value: "hasInfo", label: "Đã có thông tin" },
              { value: "noInfo", label: "Chưa có thông tin" },
            ]}
          />
          <FilterField
            label="Trạng thái tin nhắn"
            value={hasMessageFilter}
            onChange={(value) =>
              onHasMessageFilterChange(value as MessageFilterOption)
            }
            options={[
              { value: "all", label: "Tất cả" },
              { value: "hasMessage", label: "Đã có tin nhắn" },
              { value: "noMessage", label: "Chưa gửi tin" },
            ]}
          />
          <FilterField
            label="Trạng thái tin nhắn cuối"
            value={lastMessageStatusFilter}
            onChange={(value) =>
              onLastMessageStatusFilterChange(
                value as LastMessageStatusFilterOption
              )
            }
            options={[
              { value: "all", label: "Tất cả" },
              { value: "success", label: "Thành công" },
              {
                value: "messageBlocked",
                label: "Lỗi: Không thể nhận tin nhắn từ bạn",
              },
              {
                value: "strangerBlocked",
                label: "Lỗi: Chặn tin nhắn từ người lạ",
              },
              {
                value: "noMsgId",
                label: "Lỗi: Không có msgId",
              },
            ]}
          />
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500">
              Khoảng thời gian quét
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="datetime-local"
                value={scannedFrom}
                onChange={(e) => onScannedFromChange(e.target.value)}
                className="text-sm"
              />
              <Input
                type="datetime-local"
                value={scannedTo}
                onChange={(e) => onScannedToChange(e.target.value)}
                className="text-sm"
                min={scannedFrom || undefined}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500">
              Khoảng ngày tạo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="datetime-local"
                value={createdFrom}
                onChange={(e) => onCreatedFromChange(e.target.value)}
                className="text-sm"
              />
              <Input
                type="datetime-local"
                value={createdTo}
                onChange={(e) => onCreatedToChange(e.target.value)}
                className="text-sm"
                min={createdFrom || undefined}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500">
              Khoảng thời gian tin nhắn
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="datetime-local"
                value={lastMessageFrom}
                onChange={(e) => onLastMessageFromChange(e.target.value)}
                className="text-sm"
              />
              <Input
                type="datetime-local"
                value={lastMessageTo}
                onChange={(e) => onLastMessageToChange(e.target.value)}
                className="text-sm"
                min={lastMessageFrom || undefined}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-500">
              Số lần quét
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="number"
                min={0}
                value={minScanCount}
                onChange={(e) => onMinScanCountChange(e.target.value)}
                className="text-sm"
                placeholder="Tối thiểu"
              />
              <Input
                type="number"
                min={0}
                value={maxScanCount}
                onChange={(e) => onMaxScanCountChange(e.target.value)}
                className="text-sm"
                placeholder="Tối đa"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function FilterField({ label, value, options, onChange }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
