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
import { Loader2, MessageSquare, Image as ImageIcon, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";

interface PhoneNumberSendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageContent: string;
  onMessageContentChange: (content: string) => void;
  selectedImage: File | null;
  onSelectedImageChange: (image: File | null) => void;
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
  selectedImage,
  onSelectedImageChange,
  selectedAccountId,
  accounts,
  selectedCount,
  onSubmit,
  isPending,
}: PhoneNumberSendMessageDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const accountName =
    accounts.find((a) => a.id === selectedAccountId)?.displayName ||
    accounts.find((a) => a.id === selectedAccountId)?.zaloName ||
    (selectedAccountId ? `Account ${selectedAccountId}` : "đang chọn");

  // Tạo preview khi có image
  useEffect(() => {
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedImage);
    } else {
      setImagePreview(null);
    }
  }, [selectedImage]);

  // Reset khi đóng dialog
  useEffect(() => {
    if (!open) {
      onSelectedImageChange(null);
      setImagePreview(null);
    }
  }, [open, onSelectedImageChange]);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      e.target.value = "";
      return;
    }

    // Kiểm tra kích thước (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Kích thước file không được vượt quá 10MB");
      e.target.value = "";
      return;
    }

    onSelectedImageChange(file);
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    onSelectedImageChange(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

          <div>
            <Label>Hình ảnh (tùy chọn)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {!imagePreview ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleImageButtonClick}
                className="mt-1 w-full"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Chọn hình ảnh
              </Button>
            ) : (
              <div className="mt-1 relative">
                <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedImage?.name} ({(selectedImage?.size || 0) / 1024} KB)
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onMessageContentChange("");
              onSelectedImageChange(null);
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
