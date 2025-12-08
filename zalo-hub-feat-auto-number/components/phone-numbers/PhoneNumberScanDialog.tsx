import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PhoneNumberScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAccountId: number | null;
  onAccountIdChange: (accountId: number | null) => void;
  accounts: Array<{ id: number; displayName?: string; zaloName?: string }>;
  selectedCount: number;
  dialogAction:
    | "scan"
    | "send-friend-request"
    | "sync-friends"
    | "send-messages";
  onConfirm: () => void;
  isScanning?: boolean;
  isSendingFriendRequest?: boolean;
  isSyncing?: boolean;
}

export function PhoneNumberScanDialog({
  open,
  onOpenChange,
  selectedAccountId,
  onAccountIdChange,
  accounts,
  selectedCount,
  dialogAction,
  onConfirm,
  isScanning = false,
  isSendingFriendRequest = false,
  isSyncing = false,
}: PhoneNumberScanDialogProps) {
  const getTitle = () => {
    switch (dialogAction) {
      case "sync-friends":
        return "Chọn tài khoản để đồng bộ bạn bè";
      case "send-friend-request":
        return "Chọn tài khoản để gửi lời mời kết bạn";
      case "send-messages":
        return "Chọn tài khoản để gửi tin nhắn";
      default:
        return "Chọn tài khoản để quét thông tin";
    }
  };

  const getDescription = () => {
    switch (dialogAction) {
      case "sync-friends":
        return "Chọn tài khoản Zalo để đồng bộ danh sách bạn bè";
      case "send-friend-request":
        return `Chọn tài khoản Zalo để gửi lời mời kết bạn cho ${selectedCount} số điện thoại đã chọn`;
      case "send-messages":
        return `Chọn tài khoản Zalo để gửi tin nhắn cho ${selectedCount} số điện thoại đã chọn`;
      default:
        return `Chọn tài khoản Zalo để sử dụng quét thông tin cho ${selectedCount} số điện thoại đã chọn`;
    }
  };

  const isPending = isScanning || isSendingFriendRequest || isSyncing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="account">Tài khoản *</Label>
            <select
              id="account"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedAccountId || ""}
              onChange={(e) =>
                onAccountIdChange(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">-- Chọn tài khoản --</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.displayName ||
                    account.zaloName ||
                    `Account ${account.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending || !selectedAccountId}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
