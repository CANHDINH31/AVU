import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PhoneNumberDeleteAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  accountId?: number | null;
}

export function PhoneNumberDeleteAllDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  accountId,
}: PhoneNumberDeleteAllDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa hết dữ liệu</AlertDialogTitle>
          <AlertDialogDescription>
            {accountId ? (
              <>
                Bạn có chắc chắn muốn xóa <strong>TẤT CẢ</strong> số điện thoại
                của tài khoản này không? Hành động này không thể hoàn tác.
              </>
            ) : (
              <>
                Bạn có chắc chắn muốn xóa <strong>TẤT CẢ</strong> số điện thoại
                trong hệ thống không? Hành động này không thể hoàn tác.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
