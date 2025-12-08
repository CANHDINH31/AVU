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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { UpdatePhoneNumberDto } from "@/lib/api/phone-numbers";

interface PhoneNumberEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UpdatePhoneNumberDto & { phoneNumber: string };
  onFormDataChange: (
    data: UpdatePhoneNumberDto & { phoneNumber: string }
  ) => void;
  currentAccountId: number | null;
  accounts: Array<{ id: number; displayName?: string; zaloName?: string }>;
  onSubmit: () => void;
  isPending: boolean;
}

export function PhoneNumberEditDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  currentAccountId,
  accounts,
  onSubmit,
  isPending,
}: PhoneNumberEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật số điện thoại</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin số điện thoại khách hàng
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="edit-phone">Số điện thoại *</Label>
            <Input
              id="edit-phone"
              placeholder="0123456789"
              value={formData.phoneNumber}
              onChange={(e) =>
                onFormDataChange({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="edit-name">Tên</Label>
            <Input
              id="edit-name"
              placeholder="Tên khách hàng"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="edit-notes">Ghi chú</Label>
            <Textarea
              id="edit-notes"
              placeholder="Ghi chú..."
              value={formData.notes}
              onChange={(e) =>
                onFormDataChange({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="edit-account">Tài khoản</Label>
            <select
              id="edit-account"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={formData.accountId || currentAccountId || ""}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  accountId: Number(e.target.value) || undefined,
                })
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
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
