"use client";

import { memo } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Phone, Trash2, List } from "lucide-react";
import { PhoneNumber, PhoneNumberMessage } from "@/lib/api/phone-numbers";

type PhoneRow = PhoneNumber & {
  lastMessage?: PhoneNumberMessage | null;
};

interface PhoneNumberRowProps {
  phone: PhoneRow;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onViewDetails: (phone: PhoneNumber) => void;
  onDelete: (phone: PhoneNumber) => void;
}

const PhoneNumberRow = memo(function PhoneNumberRow({
  phone,
  isSelected,
  onToggleSelect,
  onViewDetails,
  onDelete,
}: PhoneNumberRowProps) {
  const formatDateTime = (value?: string | Date | null) =>
    value
      ? new Date(value).toLocaleString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "-";

  const lastScannedDisplay = formatDateTime(phone.lastScannedAt);
  const createdDisplay = formatDateTime(phone.createdAt);
  const lastMessage = phone.lastMessage;
  const lastMessageDisplay = lastMessage?.content || "Chưa có tin nhắn";
  const lastMessageTime = lastMessage
    ? new Date(lastMessage.createdAt).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-";
  const lastMessageIsSuccess =
    (lastMessage as any)?.isSuccess ?? lastMessage?.status === "sent";
  const lastMessageStatus = lastMessage
    ? lastMessageIsSuccess
      ? "Thành công"
      : "Thất bại"
    : "-";
  const lastMessageError = lastMessage?.error || "-";

  return (
    <TableRow>
      <TableCell className="sticky left-0 bg-white z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => phone.id && onToggleSelect(phone.id)}
          className="rounded border-gray-300"
          disabled={!phone.id}
        />
      </TableCell>
      <TableCell>
        {phone.avatar ? (
          <img
            src={phone.avatar}
            alt={phone.name || phone.phoneNumber}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://via.placeholder.com/40";
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <Phone className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium whitespace-nowrap">
        {phone.phoneNumber}
      </TableCell>
      <TableCell className="min-w-[180px]" title={phone.name || "-"}>
        {phone.name || "-"}
      </TableCell>
      <TableCell className="max-w-xs truncate" title={phone.notes || "-"}>
        {phone.notes || "-"}
      </TableCell>
      <TableCell>
        {phone.isFriend ? (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Có
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Không
          </span>
        )}
      </TableCell>
      <TableCell>
        {phone.hasSentFriendRequest === 1 ? (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Đã gửi
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Chưa gửi
          </span>
        )}
      </TableCell>
      <TableCell>{phone.scanCount ?? 0}</TableCell>
      <TableCell className="min-w-[220px]">
        {phone.hasScanInfo ? (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Đã có thông tin
          </span>
        ) : (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Chưa có
          </span>
        )}
      </TableCell>
      <TableCell>{lastScannedDisplay}</TableCell>
      <TableCell>{createdDisplay}</TableCell>
      <TableCell className="max-w-sm align-top" title={lastMessageDisplay}>
        <span className="line-clamp-2 text-sm text-gray-700">
          {lastMessageDisplay}
        </span>
      </TableCell>
      <TableCell>
        {lastMessage ? (
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              lastMessageIsSuccess
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {lastMessageStatus}
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell
        className="max-w-sm align-top"
        title={lastMessageError !== "-" ? lastMessageError : undefined}
      >
        <span className="line-clamp-2 text-xs text-red-600">
          {lastMessageError}
        </span>
      </TableCell>
      <TableCell>{lastMessageTime}</TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(phone)}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(phone)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

interface PhoneNumberTableProps {
  phoneRows: PhoneRow[];
  selectedIds: Set<number>;
  onSelectAll: () => void;
  onSelectOne: (id: number) => void;
  onViewDetails: (phone: PhoneNumber) => void;
  onDelete: (phone: PhoneNumber) => void;
}

export function PhoneNumberTable({
  phoneRows,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onViewDetails,
  onDelete,
}: PhoneNumberTableProps) {
  return (
    <div className="w-full overflow-hidden">
      <div
        className="max-h-[65vh] w-full overflow-x-auto overflow-y-auto pb-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-400"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 #f1f5f9" }}
      >
        <table className={cn("w-full caption-bottom text-sm min-w-[1500px]")}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 sticky left-0 top-0 z-30 bg-white">
                <input
                  type="checkbox"
                  checked={
                    phoneRows.length > 0 &&
                    selectedIds.size === phoneRows.length &&
                    phoneRows.every((p) => !p.id || selectedIds.has(p.id))
                  }
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead className="w-16 whitespace-nowrap sticky top-0 bg-white z-20">
                Avatar
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Số điện thoại
              </TableHead>
              <TableHead className="whitespace-nowrap min-w-[180px] sticky top-0 bg-white z-20">
                Tên
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Ghi chú
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Là bạn bè
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Đã gửi lời mời
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Số lần quét
              </TableHead>
              <TableHead className="whitespace-nowrap min-w-[220px] sticky top-0 bg-white z-20">
                Thông tin quét
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Lần quét gần nhất
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Ngày tạo
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Tin nhắn cuối
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Trạng thái gửi
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Lỗi gửi
              </TableHead>
              <TableHead className="whitespace-nowrap sticky top-0 bg-white z-20">
                Thời gian tin nhắn
              </TableHead>
              <TableHead className="text-right whitespace-nowrap sticky top-0 bg-white z-20">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {phoneRows.map((phone) => (
              <PhoneNumberRow
                key={phone.id ?? phone.phoneNumber}
                phone={phone}
                isSelected={phone.id ? selectedIds.has(phone.id) : false}
                onToggleSelect={onSelectOne}
                onViewDetails={onViewDetails}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
