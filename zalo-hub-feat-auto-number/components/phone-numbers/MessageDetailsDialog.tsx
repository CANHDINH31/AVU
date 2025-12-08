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
import { Loader2, MessageSquare, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  mode: "auto" | "manual";
}

export function MessageDetailsDialog({
  open,
  onOpenChange,
  accountId,
  mode,
}: MessageDetailsDialogProps) {
  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["message-details", accountId, mode, todayDate],
    queryFn: () =>
      phoneNumbersApi.getMessageDetails(accountId, mode, todayDate),
    enabled: open && !!accountId,
    initialData: [],
  });

  const isAutoMode = mode === "auto";
  const headerLabel = isAutoMode
    ? "Chi tiết tin nhắn tự động"
    : "Chi tiết tin nhắn thủ công";
  const descriptionLabel = isAutoMode
    ? "Danh sách tin nhắn đã gửi bằng chế độ tự động trong ngày (Giới hạn: 240 tin nhắn/ngày)"
    : "Danh sách tin nhắn đã gửi thủ công trong ngày";

  const formatDateTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const successCount =
    messages?.filter((msg) => msg.isSuccess === true).length || 0;
  const failedCount =
    messages?.filter((msg) => msg.isSuccess === false).length || 0;
  const totalCount = messages?.length || 0;

  const renderName = (msg: (typeof messages)[number]) => {
    const phone = msg.phone;
    const name = phone?.name || phone?.zaloName;
    return name || "—";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {headerLabel}
          </DialogTitle>
          <DialogDescription>{descriptionLabel}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : totalCount === 0 ? (
          <div className="py-12 text-center text-gray-500">
            Chưa có tin nhắn nào được ghi nhận hôm nay
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 flex-shrink-0">
              <div>
                <div className="text-sm text-gray-600">Tổng số tin nhắn</div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalCount}
                  {isAutoMode && (
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      / 240
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Thành công</div>
                <div className="text-2xl font-bold text-green-600">
                  {successCount}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Thất bại</div>
                <div className="text-2xl font-bold text-rose-600">
                  {failedCount}
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
              <div className="overflow-auto flex-1">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-16" />
                    <col className="w-48" />
                    <col className="w-40" />
                    <col className="w-auto" />
                    <col className="w-32" />
                    <col className="w-auto" />
                    <col className="w-40" />
                  </colgroup>
                  <thead className="border-b bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Số điện thoại
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Tên
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Nội dung tin nhắn
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Lỗi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        Thời gian gửi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {messages?.map((message, index) => (
                      <tr key={message.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 break-words">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={message.phone?.avatar || undefined}
                                alt={message.phoneNumberStr}
                              />
                              <AvatarFallback>
                                {message.phoneNumberStr?.slice(-2) || "PN"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>{message.phoneNumberStr}</span>
                              {message.phone?.hasScanInfo ? (
                                <span className="text-[11px] text-blue-600">
                                  Đã có thông tin
                                </span>
                              ) : (
                                <span className="text-[11px] text-gray-500">
                                  Chưa có thông tin
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex flex-col">
                            <span
                              className="font-medium"
                              title={renderName(message)}
                            >
                              {renderName(message)}
                            </span>
                            {message.phone?.notes ? (
                              <span
                                className="text-xs text-gray-500 line-clamp-2"
                                title={message.phone.notes}
                              >
                                {message.phone.notes}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div
                            className="break-words line-clamp-3"
                            title={message.content}
                          >
                            {message.content}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {message.isSuccess === true ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Thành công
                            </span>
                          ) : message.isSuccess === false ? (
                            <span className="inline-flex items-center gap-1 text-rose-600">
                              <XCircle className="h-4 w-4" />
                              Thất bại
                            </span>
                          ) : (
                            <span className="text-gray-500">Chưa xác định</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {message.error ? (
                            <div
                              className="text-red-600 break-words line-clamp-3"
                              title={message.error}
                            >
                              {message.error}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 break-words">
                          {formatDateTime(message.createdAt)}
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
