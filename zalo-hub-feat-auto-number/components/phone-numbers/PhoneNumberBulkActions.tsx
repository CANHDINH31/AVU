import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRef, useState } from "react";
import {
  Search,
  UserPlus,
  Undo2,
  MessageSquare,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PhoneNumberBulkActionsProps {
  selectedCount: number;
  onScan: () => void;
  onToggleAutoScan?: (enabled: boolean) => void;
  onSendFriendRequest: () => void;
  onToggleAutoFriendRequest?: (enabled: boolean) => void;
  onAutoFriendRequestTimeInputChange?: (time: string) => void;
  onAutoFriendRequestTimeChange?: (time: string) => void;
  onUndoFriendRequest: () => void;
  onSendMessage: () => void;
  onToggleAutoMessage?: (enabled: boolean) => void;
  onBulkMessageContentChange?: (content: string) => void;
  onBulkMessageContentConfirm?: (content: string) => void;
  bulkMessageContent?: string;
  bulkMessageContentInput?: string;
  onDelete: () => void;
  isScanning?: boolean;
  isAutoScanEnabled?: boolean;
  isTogglingAutoScan?: boolean;
  isSendingFriendRequest?: boolean;
  isAutoFriendRequestEnabled?: boolean;
  isTogglingAutoFriendRequest?: boolean;
  autoFriendRequestStartTime?: string;
  autoFriendRequestStartTimeInput?: string;
  isUndoingFriendRequest?: boolean;
  isSendingMessage?: boolean;
  isAutoMessageEnabled?: boolean;
  isTogglingAutoMessage?: boolean;
  isDeleting?: boolean;
  autoScanWindow?: {
    startHour: number;
    endHour: number;
  };
  isWithinMessageAutoScanWindow?: boolean;
}

export function PhoneNumberBulkActions({
  selectedCount,
  onScan,
  onToggleAutoScan,
  onSendFriendRequest,
  onToggleAutoFriendRequest,
  onAutoFriendRequestTimeInputChange,
  onAutoFriendRequestTimeChange,
  onUndoFriendRequest,
  onSendMessage,
  onToggleAutoMessage,
  onBulkMessageContentChange,
  onBulkMessageContentConfirm,
  bulkMessageContent = "",
  bulkMessageContentInput = "",
  onDelete,
  isScanning = false,
  isAutoScanEnabled = false,
  isTogglingAutoScan = false,
  isSendingFriendRequest = false,
  isAutoFriendRequestEnabled = false,
  isTogglingAutoFriendRequest = false,
  autoFriendRequestStartTime = "09:00",
  autoFriendRequestStartTimeInput = "09:00",
  isUndoingFriendRequest = false,
  isSendingMessage = false,
  isAutoMessageEnabled = false,
  isTogglingAutoMessage = false,
  isDeleting = false,
  autoScanWindow = { startHour: 7, endHour: 14 },
  isWithinMessageAutoScanWindow = false,
}: PhoneNumberBulkActionsProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const bulkMessageContentRef = useRef<HTMLTextAreaElement | null>(null);
  const now = new Date();
  const currentHour = now.getHours();
  const { startHour, endHour } = autoScanWindow;
  const isWithinAutoScanWindow =
    startHour === endHour
      ? true
      : startHour < endHour
      ? currentHour >= startHour && currentHour < endHour
      : currentHour >= startHour || currentHour < endHour;
  const canEnableAutoScan = !isWithinAutoScanWindow; // Chỉ cho bật ngoài khung giờ
  const canDisableAutoScan = !isWithinAutoScanWindow; // Chỉ cho tắt ngoài khung giờ
  const noSelection = selectedCount === 0;
  const quickScanDisabled =
    noSelection || isScanning || isAutoScanEnabled || isTogglingAutoScan;
  const autoScanSwitchDisabled =
    isTogglingAutoScan ||
    (isAutoScanEnabled && !canDisableAutoScan) ||
    (!isAutoScanEnabled && !canEnableAutoScan); // Không cho bật trong khung giờ
  const autoFriendRequestSwitchDisabled = isTogglingAutoFriendRequest;
  const manualFriendRequestDisabled =
    noSelection ||
    isSendingFriendRequest ||
    isAutoFriendRequestEnabled ||
    isTogglingAutoFriendRequest;
  // Check if we can toggle auto message (not during scan windows)
  const canToggleAutoMessage = !isWithinMessageAutoScanWindow;
  const autoMessageSwitchDisabled =
    isTogglingAutoMessage || !canToggleAutoMessage;
  const manualMessageDisabled =
    noSelection ||
    isSendingMessage ||
    isAutoMessageEnabled ||
    isTogglingAutoMessage;

  const handleAutoScanInfoClick = () => {
    if (autoScanSwitchDisabled) {
      return;
    }
    handleAutoScanToggle(!isAutoScanEnabled);
  };

  const handleAutoScanToggle = (enabled: boolean) => {
    if (!onToggleAutoScan) {
      return;
    }
    // Không cho bật trong khung giờ 7h-14h
    if (!isAutoScanEnabled && enabled && !canEnableAutoScan) {
      return;
    }
    // Không cho tắt trong khung giờ 7h-14h
    if (isAutoScanEnabled && !enabled && !canDisableAutoScan) {
      return;
    }
    onToggleAutoScan(enabled);
  };

  const handleAutoFriendRequestToggle = (enabled: boolean) => {
    if (!onToggleAutoFriendRequest) {
      return;
    }
    onToggleAutoFriendRequest(enabled);
  };

  const handleFriendRequestTimeInputChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (onAutoFriendRequestTimeInputChange) {
      const hour = e.target.value.padStart(2, "0");
      onAutoFriendRequestTimeInputChange(`${hour}:00`);
    }
  };

  const handleAutoMessageToggle = (enabled: boolean) => {
    if (!onToggleAutoMessage) {
      return;
    }
    // Prevent toggling during auto-scan windows
    if (isWithinMessageAutoScanWindow) {
      return;
    }
    onToggleAutoMessage(enabled);
  };

  const handleBulkMessageContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    // Chỉ cập nhật vào ref để tránh re-render gây mất focus
    if (bulkMessageContentRef.current) {
      bulkMessageContentRef.current.value = e.target.value;
    }
  };

  const handleBulkMessageContentConfirm = () => {
    const value = bulkMessageContentRef.current?.value ?? "";
    if (onBulkMessageContentConfirm) {
      onBulkMessageContentConfirm(value);
    }
    if (onBulkMessageContentChange) {
      onBulkMessageContentChange(value);
    }
  };

  // Generate all hours (0-23)
  const allHours = Array.from({ length: 24 }, (_, i) => i);

  const warningMessages: string[] = [];

  // Cảnh báo về quét tự động
  if (isAutoScanEnabled) {
    warningMessages.push(
      `Đang bật quét tự động từ ${startHour}h đến ${endHour}h. Muốn dùng quét nhanh cần tắt quét tự động trước.`
    );
    if (!canDisableAutoScan) {
      warningMessages.push(
        `Bạn chỉ có thể tắt quét tự động ngoài khung ${startHour}h-${endHour}h.`
      );
    }
  } else if (!canEnableAutoScan) {
    warningMessages.push(
      `Chỉ có thể bật quét tự động ngoài khung ${startHour}h-${endHour}h. Hiện tại là ${currentHour}h.`
    );
  }

  if (isAutoFriendRequestEnabled) {
    warningMessages.push(
      `Đang bật gửi lời mời tự động bắt đầu từ ${autoFriendRequestStartTime}. Muốn gửi thủ công cần tắt tự động trước.`
    );
  }

  if (isAutoMessageEnabled) {
    warningMessages.push(
      `Đang bật gửi tin nhắn tự động. Hệ thống sẽ tự động quét và gửi trong khung giờ 9h-11h và 14h-16h, cách nhau 30 phút. Muốn gửi thủ công cần tắt tự động trước.`
    );
  }
  if (isWithinMessageAutoScanWindow) {
    warningMessages.push(
      `Đang trong khung giờ tự động (9h-11h hoặc 14h-16h). Không thể bật/tắt gửi tin nhắn tự động trong thời gian này.`
    );
  }

  // Helper component for action row with auto toggle
  const ActionRow = ({
    manualButton,
    autoToggle,
    autoTimePicker,
    extraContent,
  }: {
    manualButton: React.ReactNode;
    autoToggle: React.ReactNode;
    autoTimePicker?: React.ReactNode;
    extraContent?: React.ReactNode;
  }) => (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">{manualButton}</div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {autoToggle}
          {autoTimePicker}
        </div>
      </div>
      {extraContent && <div className="mt-2">{extraContent}</div>}
    </div>
  );

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white/70 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header - Always Visible */}
      <div
        className="flex items-center justify-between gap-3 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-700">
            Quản lý thao tác hàng loạt
          </p>
          <p className="text-xs text-slate-500">
            {noSelection
              ? "Chưa chọn số nào"
              : `Đang chọn ${selectedCount} số điện thoại`}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 text-slate-600" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-600" />
          )}
        </Button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-slate-100">
          {/* Warning Messages */}
          {warningMessages.length > 0 && (
            <div className="space-y-1 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
              {warningMessages.map((message, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Actions with Auto Toggle */}
          <div className="flex flex-col gap-3">
            {/* Scan Section */}
            <ActionRow
              manualButton={
                <Button
                  variant="default"
                  size="sm"
                  onClick={onScan}
                  disabled={quickScanDisabled}
                  className="w-full sm:w-auto"
                >
                  {isScanning ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Quét nhanh ({selectedCount})
                </Button>
              }
              autoToggle={
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <Switch
                    id="auto-scan-toggle"
                    checked={isAutoScanEnabled}
                    disabled={autoScanSwitchDisabled}
                    onCheckedChange={handleAutoScanToggle}
                  />
                  <button
                    type="button"
                    onClick={handleAutoScanInfoClick}
                    disabled={autoScanSwitchDisabled}
                    className="text-left text-xs focus:outline-none disabled:cursor-not-allowed"
                  >
                    <p className="font-semibold text-slate-700">
                      Quét tự động{" "}
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isAutoScanEnabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isAutoScanEnabled ? "Đang bật" : "Đang tắt"}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {startHour}h - {endHour}h hàng ngày
                    </p>
                  </button>
                </div>
              }
            />

            {/* Friend Request Section */}
            <ActionRow
              manualButton={
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSendFriendRequest}
                  disabled={manualFriendRequestDisabled}
                  className="w-full sm:w-auto"
                >
                  {isSendingFriendRequest ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="mr-2 h-4 w-4" />
                  )}
                  Gửi lời mời kết bạn ({selectedCount})
                </Button>
              }
            />

            {/* Message Section */}
            <ActionRow
              manualButton={
                <Button
                  variant="default"
                  size="sm"
                  onClick={onSendMessage}
                  disabled={manualMessageDisabled}
                  className="w-full sm:w-auto"
                >
                  {isSendingMessage ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="mr-2 h-4 w-4" />
                  )}
                  Gửi tin nhắn hàng loạt ({selectedCount})
                </Button>
              }
              autoToggle={
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <Switch
                    id="auto-message-toggle"
                    checked={isAutoMessageEnabled}
                    disabled={autoMessageSwitchDisabled}
                    onCheckedChange={handleAutoMessageToggle}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleAutoMessageToggle(!isAutoMessageEnabled)
                    }
                    disabled={autoMessageSwitchDisabled}
                    className="text-left text-xs focus:outline-none disabled:cursor-not-allowed"
                  >
                    <p className="font-semibold text-slate-700">
                      Gửi tự động{" "}
                      <span
                        className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isAutoMessageEnabled
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isAutoMessageEnabled ? "Đang bật" : "Đang tắt"}
                      </span>
                    </p>
                  </button>
                </div>
              }
              autoTimePicker={
                isAutoMessageEnabled && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2 py-1.5 shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">
                      9h-11h & 14h-16h
                    </span>
                  </div>
                )
              }
              extraContent={
                isAutoMessageEnabled && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="bulk-message-content"
                      className="text-xs font-medium text-slate-700"
                    >
                      Nội dung tin nhắn:
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        ref={bulkMessageContentRef}
                        id="bulk-message-content"
                        placeholder="Nhập nội dung tin nhắn để gửi hàng loạt..."
                        defaultValue={bulkMessageContentInput ?? ""}
                        onChange={handleBulkMessageContentChange}
                        className="flex-1 p-2 min-h-[80px] text-sm resize-none"
                        disabled={autoMessageSwitchDisabled}
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 px-3 self-start"
                        onClick={handleBulkMessageContentConfirm}
                        disabled={autoMessageSwitchDisabled}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Xác nhận
                      </Button>
                    </div>
                  </div>
                )
              }
            />
          </div>

          {/* Manual Only Actions */}
          <div className="flex flex-wrap items-stretch gap-2 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3.5 shadow-sm">
            <Button
              variant="default"
              size="sm"
              onClick={onUndoFriendRequest}
              disabled={isUndoingFriendRequest || noSelection}
            >
              {isUndoingFriendRequest ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Undo2 className="mr-2 h-4 w-4" />
              )}
              Thu hồi lời mời
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              disabled={isDeleting || noSelection}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Xóa hàng loạt ({selectedCount})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
