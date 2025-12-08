"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { phoneNumbersApi } from "@/lib/api/phone-numbers";
import { Loader2, UserPlus, Undo2 } from "lucide-react";

interface FriendRequestDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  mode: "auto" | "manual";
}

export function FriendRequestDetailsDialog({
  open,
  onOpenChange,
  accountId,
  mode,
}: FriendRequestDetailsDialogProps) {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["daily-scan-statistics", accountId],
    queryFn: () => phoneNumbersApi.getDailyStatistics(accountId),
    enabled: open && !!accountId,
  });

  const isAutoMode = mode === "auto";
  const sentList = isAutoMode
    ? statistics?.autoFriendRequestDetails || []
    : statistics?.manualFriendRequestDetails || [];
  const cancelList = isAutoMode
    ? statistics?.autoFriendCancelDetails || []
    : statistics?.manualFriendCancelDetails || [];

  const totalSentToday = isAutoMode
    ? statistics?.autoFriendRequestsSentToday || 0
    : statistics?.manualFriendRequestsSentToday || 0;
  const totalCanceledToday = isAutoMode
    ? statistics?.autoFriendRequestsCanceledToday || 0
    : statistics?.manualFriendRequestsCanceledToday || 0;

  const entryRows = [
    ...sentList.map((detail) => ({ ...detail, action: "sent" })),
    ...cancelList.map((detail) => ({ ...detail, action: "canceled" })),
  ].sort(
    (a, b) => new Date(b.actionAt).getTime() - new Date(a.actionAt).getTime()
  );

  const headerLabel = isAutoMode
    ? "Chi tiết lời mời kết bạn tự động"
    : "Chi tiết lời mời kết bạn thủ công";
  const descriptionLabel = isAutoMode
    ? "Danh sách lời mời đã gửi/thu hồi bằng chế độ tự động trong ngày"
    : "Danh sách lời mời đã gửi/thu hồi thủ công trong ngày";

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {headerLabel}
          </DialogTitle>
          <DialogDescription>{descriptionLabel}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : entryRows.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Chưa có lời mời nào được ghi nhận hôm nay
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <div className="text-sm text-gray-600">Đã gửi hôm nay</div>
                <div className="text-2xl font-bold text-purple-600">
                  {totalSentToday}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đã thu hồi hôm nay</div>
                <div className="text-2xl font-bold text-rose-600">
                  {totalCanceledToday}
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Số điện thoại
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Hành động
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {entryRows.map((entry, index) => (
                      <tr
                        key={`${entry.phoneNumberId}-${entry.actionAt}-${entry.action}`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {entry.phoneNumberStr || `#${entry.phoneNumberId}`}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {entry.action === "sent" ? (
                            <span className="inline-flex items-center gap-1 text-purple-700">
                              <UserPlus className="h-4 w-4" />
                              Đã gửi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600">
                              <Undo2 className="h-4 w-4" />
                              Đã thu hồi
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDateTime(entry.actionAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
