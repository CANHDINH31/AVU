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
import { Loader2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { phoneNumbersApi } from "@/lib/api/phone-numbers";

interface DailyScanDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  mode: "auto" | "manual";
}

export function DailyScanDetailsDialog({
  open,
  onOpenChange,
  accountId,
  mode,
}: DailyScanDetailsDialogProps) {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["daily-scan-statistics", accountId],
    queryFn: () => phoneNumbersApi.getDailyStatistics(accountId),
    enabled: open && !!accountId,
  });
  const isAutoMode = mode === "auto";

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const sourceWithInfo = isAutoMode
    ? statistics?.withInfoDetails || []
    : statistics?.manualWithInfoDetails || [];
  const sourceWithoutInfo = isAutoMode
    ? statistics?.withoutInfoDetails || []
    : statistics?.manualWithoutInfoDetails || [];

  const detailRows = statistics
    ? [
        ...sourceWithInfo.map((detail) => ({
          ...detail,
          hasInfo: true,
        })),
        ...sourceWithoutInfo.map((detail) => ({
          ...detail,
          hasInfo: false,
        })),
      ].sort(
        (a, b) =>
          new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
      )
    : [];

  const dailyWithInfo = sourceWithInfo.length;
  const dailyWithoutInfo = sourceWithoutInfo.length;
  const headerLabel = isAutoMode
    ? "Chi tiết quét tự động"
    : "Chi tiết quét thủ công";
  const descriptionLabel = isAutoMode
    ? "Danh sách các số được quét tự động trong ngày"
    : "Danh sách các số được quét thủ công trong ngày";
  const totalScans = isAutoMode
    ? statistics?.dailyScanCount || detailRows.length
    : statistics?.manualScanCount || detailRows.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {headerLabel}
          </DialogTitle>
          <DialogDescription>{descriptionLabel}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : detailRows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              Chưa có số điện thoại nào được quét hôm nay
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Đã quét hôm nay</div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalScans}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Có thông tin</div>
                <div className="text-2xl font-bold text-green-600">
                  {dailyWithInfo}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Không có thông tin</div>
                <div className="text-2xl font-bold text-orange-600">
                  {dailyWithoutInfo}
                </div>
              </div>
            </div>

            {/* Details List */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số điện thoại
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Thời gian quét
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {detailRows.map((detail, index) => (
                      <tr
                        key={`${detail.phoneNumberId}-${detail.scannedAt}-${detail.hasInfo}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {detail.phoneNumberStr}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {detail.hasInfo ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="w-4 h-4" />
                              Có thông tin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-orange-600">
                              <XCircle className="w-4 h-4" />
                              Không có thông tin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {formatDateTime(detail.scannedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
