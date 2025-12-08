import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap } from "lucide-react";

interface PhoneNumberScanTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSelectFast: () => void;
  onSelectSlow: () => void;
  onSelectAll: () => void;
  isPending?: boolean;
}

export function PhoneNumberScanTypeDialog({
  open,
  onOpenChange,
  selectedCount,
  onSelectFast,
  isPending = false,
}: PhoneNumberScanTypeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Xác nhận quét nhanh</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Alert
            variant={"default"}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50"
          >
            <div className="bg-amber-100 text-amber-600">
              <Zap className="h-4 w-4" />
            </div>
            <AlertDescription className="text-sm leading-relaxed text-slate-700">
              Chỉ nên thể quét nhanh tối đa 40 số trong 1 giờ để đạt hiệu quả
              tốt nhất. Hãy xác nhận khi bạn sẵn sàng.
            </AlertDescription>
          </Alert>
        </div>
        <DialogFooter>
          <Button
            onClick={onSelectFast}
            disabled={isPending || selectedCount === 0}
          >
            Xác nhận quét nhanh
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
