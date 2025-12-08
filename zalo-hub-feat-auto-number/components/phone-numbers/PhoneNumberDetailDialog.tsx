import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PhoneNumber } from "@/lib/api/phone-numbers";

interface PhoneNumberDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: PhoneNumber | null;
}

export function PhoneNumberDetailDialog({
  open,
  onOpenChange,
  phoneNumber,
}: PhoneNumberDetailDialogProps) {
  const detailMessageHistory = phoneNumber?.messageHistory
    ? [...phoneNumber.messageHistory].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết số {phoneNumber?.phoneNumber || ""}
          </DialogTitle>
          <DialogDescription>
            Thông tin và lịch sử tin nhắn gần đây
          </DialogDescription>
        </DialogHeader>
        {phoneNumber ? (
          <div className="space-y-6 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Tên</p>
                <p className="text-base font-medium text-gray-900">
                  {phoneNumber.name || "Chưa có"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ghi chú</p>
                <p className="text-base font-medium text-gray-900">
                  {phoneNumber.notes || "Không có"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Là bạn bè</p>
                <Badge variant={phoneNumber.isFriend ? "default" : "outline"}>
                  {phoneNumber.isFriend ? "Có" : "Không"}
                </Badge>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Lịch sử tin nhắn
                </h4>
                <span className="text-xs text-gray-500">
                  {detailMessageHistory.length} bản ghi
                </span>
              </div>
              {detailMessageHistory.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Chưa có tin nhắn nào được gửi cho số này.
                </p>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {detailMessageHistory.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-gray-600">
                          {new Date(msg.createdAt).toLocaleString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <Badge
                          variant={
                            msg.status === "sent" ? "default" : "destructive"
                          }
                        >
                          {msg.status === "sent" ? "Thành công" : "Thất bại"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.error && (
                        <p className="mt-2 text-xs text-red-500">
                          Lỗi: {msg.error}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-gray-500">
            Không có dữ liệu
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
