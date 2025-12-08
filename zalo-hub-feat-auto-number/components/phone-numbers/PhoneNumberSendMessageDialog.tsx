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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare } from "lucide-react";

interface PhoneNumberSendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageContent: string;
  onMessageContentChange: (content: string) => void;
  selectedAccountId: number | null;
  accounts: Array<{ id: number; displayName?: string; zaloName?: string }>;
  selectedCount: number;
  onSubmit: () => void;
  isPending: boolean;
}

export function PhoneNumberSendMessageDialog({
  open,
  onOpenChange,
  messageContent,
  onMessageContentChange,
  selectedAccountId,
  accounts,
  selectedCount,
  onSubmit,
  isPending,
}: PhoneNumberSendMessageDialogProps) {
  const accountName =
    accounts.find((a) => a.id === selectedAccountId)?.displayName ||
    accounts.find((a) => a.id === selectedAccountId)?.zaloName ||
    (selectedAccountId ? `Account ${selectedAccountId}` : "đang chọn");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gửi tin nhắn hàng loạt</DialogTitle>
          <DialogDescription>
            Nhập nội dung tin nhắn để gửi cho {selectedCount} số điện thoại đã
            chọn
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Tin nhắn sẽ được gửi bằng tài khoản{" "}
            <span className="font-semibold">{accountName}</span>. Muốn đổi tài
            khoản, hãy chọn lại ở phần phía trên.
          </div>
          <div>
            <Label htmlFor="message-content">Nội dung tin nhắn *</Label>
            <Textarea
              id="message-content"
              placeholder="Nhập nội dung tin nhắn..."
              value={messageContent}
              onChange={(e) => onMessageContentChange(e.target.value)}
              rows={6}
              className="mt-1 rounded-lg border border-gray-200 px-3 py-3 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-sm text-gray-500 mt-1">
              {messageContent.length} ký tự
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onMessageContentChange("");
            }}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isPending || !messageContent.trim() || !selectedAccountId}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Gửi tin nhắn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
