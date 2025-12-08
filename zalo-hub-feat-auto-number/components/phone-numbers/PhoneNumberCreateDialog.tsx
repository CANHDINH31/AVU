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
import { CreatePhoneNumberDto } from "@/lib/api/phone-numbers";

interface PhoneNumberCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreatePhoneNumberDto;
  onFormDataChange: (data: CreatePhoneNumberDto) => void;
  currentAccountId: number | null;
  accounts: Array<{ id: number; displayName?: string; zaloName?: string }>;
  onSubmit: () => void;
  isPending: boolean;
}

export function PhoneNumberCreateDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  currentAccountId,
  accounts,
  onSubmit,
  isPending,
}: PhoneNumberCreateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm số điện thoại mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin số điện thoại khách hàng
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="phone">Số điện thoại *</Label>
            <Input
              id="phone"
              placeholder="0123456789"
              value={formData.phoneNumber}
              onChange={(e) =>
                onFormDataChange({ ...formData, phoneNumber: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              placeholder="Tên khách hàng"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú..."
              value={formData.notes}
              onChange={(e) =>
                onFormDataChange({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="create-account">Tài khoản</Label>
            <select
              id="create-account"
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
                Đang tạo...
              </>
            ) : (
              "Tạo mới"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
