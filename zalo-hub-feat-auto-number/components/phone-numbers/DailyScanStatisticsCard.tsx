"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  BarChart3,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { phoneNumbersApi } from "@/lib/api/phone-numbers";
import { DailyScanDetailsDialog } from "./DailyScanDetailsDialog";
import { FriendRequestDetailsDialog } from "./FriendRequestDetailsDialog";
import { MessageDetailsDialog } from "./MessageDetailsDialog";

type DailyStatisticsResponse = Awaited<
  ReturnType<typeof phoneNumbersApi.getDailyStatistics>
>;

type ExtendedDailyStatisticsResponse = DailyStatisticsResponse & {
  manualMessageToday: number;
  autoMessageToday: number;
  limitAutoMessageToday: number;
};

interface DailyScanStatisticsCardProps {
  accountId: number | null;
}

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection = ({
  title,
  icon: Icon,
  isCollapsed,
  onToggle,
  children,
}: CollapsibleSectionProps) => (
  <Card className="border border-gray-200 bg-white shadow-sm">
    <CardHeader className="py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base font-semibold text-gray-900">
            {title}
          </CardTitle>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 px-2 py-1 text-gray-600 transition hover:bg-gray-50"
          aria-label={isCollapsed ? "Mở" : "Đóng"}
        >
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </CardHeader>
    {!isCollapsed && <CardContent className="pt-0">{children}</CardContent>}
  </Card>
);

const MetricTile = ({
  label,
  value,
  subLabel,
  accentClass = "text-gray-900",
}: {
  label: string;
  value: React.ReactNode;
  subLabel?: string;
  accentClass?: string;
}) => (
  <div className="rounded border border-gray-200 bg-white p-2 shadow-sm">
    <div className="text-[10px] uppercase tracking-wide text-gray-500">
      {label}
    </div>
    <div className={`text-lg font-bold ${accentClass}`}>{value}</div>
    {subLabel ? (
      <div className="mt-0.5 text-[10px] text-gray-500">{subLabel}</div>
    ) : null}
  </div>
);

export function DailyScanStatisticsCard({
  accountId,
}: DailyScanStatisticsCardProps) {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [detailsMode, setDetailsMode] = useState<"auto" | "manual">("auto");
  const [isFriendDialogOpen, setIsFriendDialogOpen] = useState(false);
  const [friendDetailsMode, setFriendDetailsMode] = useState<"auto" | "manual">(
    "auto"
  );
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageDetailsMode, setMessageDetailsMode] = useState<
    "auto" | "manual"
  >("manual");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    data: statistics,
    isLoading,
    error,
  } = useQuery<DailyStatisticsResponse>({
    queryKey: ["daily-scan-statistics", accountId],
    queryFn: () => phoneNumbersApi.getDailyStatistics(accountId!),
    enabled: !!accountId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleOpenDetails = (mode: "auto" | "manual") => {
    setDetailsMode(mode);
    setIsDetailsDialogOpen(true);
  };

  const handleOpenFriendDetails = (mode: "auto" | "manual") => {
    setFriendDetailsMode(mode);
    setIsFriendDialogOpen(true);
  };

  const handleOpenMessageDetails = (mode: "auto" | "manual") => {
    setMessageDetailsMode(mode);
    setIsMessageDialogOpen(true);
  };

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toISOString().split("T")[0];

  // Get message details for both auto and manual modes (today only)
  const { data: autoMessageDetails = [] } = useQuery({
    queryKey: ["message-details", accountId, "auto", todayDate],
    queryFn: () =>
      phoneNumbersApi.getMessageDetails(accountId!, "auto", todayDate),
    enabled: !!accountId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale to refetch immediately
    refetchOnMount: true, // Refetch when component mounts
    initialData: [],
  });

  const { data: manualMessageDetails = [] } = useQuery({
    queryKey: ["message-details", accountId, "manual", todayDate],
    queryFn: () =>
      phoneNumbersApi.getMessageDetails(accountId!, "manual", todayDate),
    enabled: !!accountId,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 0, // Always consider data stale to refetch immediately
    refetchOnMount: true, // Refetch when component mounts
    initialData: [],
  });

  // Calculate statistics from message-details API (today only)
  const autoMessagesToday = autoMessageDetails?.length || 0;
  const manualMessagesToday = manualMessageDetails?.length || 0;

  const autoSuccessCount =
    autoMessageDetails?.filter((msg) => msg.isSuccess === true).length || 0;
  const autoFailedCount =
    autoMessageDetails?.filter((msg) => msg.isSuccess === false).length || 0;

  const manualSuccessCount =
    manualMessageDetails?.filter((msg) => msg.isSuccess === true).length || 0;
  const manualFailedCount =
    manualMessageDetails?.filter((msg) => msg.isSuccess === false).length || 0;

  if (!accountId) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Vui lòng chọn tài khoản để xem thống kê quét
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Không thể tải thống kê quét. Vui lòng thử lại sau.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats: ExtendedDailyStatisticsResponse =
    (statistics as ExtendedDailyStatisticsResponse) ?? {
      date: new Date().toISOString().split("T")[0],
      totalScanned: 0,
      withInfo: 0,
      withoutInfo: 0,
      dailyScanCount: 0,
      manualScanCount: 0,
      maxScansPerDay: 240,
      remaining: 240,
      scanEnabled: true,
      withInfoDetails: [],
      withoutInfoDetails: [],
      manualWithInfoDetails: [],
      manualWithoutInfoDetails: [],
      autoFriendRequestsSentToday: 0,
      autoFriendRequestsCanceledToday: 0,
      autoFriendRequestsSentTotal: 0,
      autoFriendRequestsCanceledTotal: 0,
      manualFriendRequestsSentToday: 0,
      manualFriendRequestsCanceledToday: 0,
      manualFriendRequestsSentTotal: 0,
      manualFriendRequestsCanceledTotal: 0,
      autoFriendRequestDetails: [],
      autoFriendCancelDetails: [],
      manualFriendRequestDetails: [],
      manualFriendCancelDetails: [],
      autoFriendRequestDailyLimit: 40,
      manualMessageToday: 0,
      autoMessageToday: 0,
      limitAutoMessageToday: 200,
    };

  const progressPercentage =
    stats.maxScansPerDay > 0
      ? (stats.dailyScanCount / stats.maxScansPerDay) * 100
      : 0;
  const todayWithInfo = stats.withInfoDetails?.length || 0;
  const todayWithoutInfo = stats.withoutInfoDetails?.length || 0;
  const manualWithInfo = stats.manualWithInfoDetails?.length || 0;
  const manualWithoutInfo = stats.manualWithoutInfoDetails?.length || 0;
  const manualSentToday = stats.manualFriendRequestsSentToday || 0;
  const manualCanceledToday = stats.manualFriendRequestsCanceledToday || 0;
  const manualSentTotal = stats.manualFriendRequestsSentTotal || 0;
  const manualCanceledTotal = stats.manualFriendRequestsCanceledTotal || 0;
  const autoMessageDailyLimit = stats.limitAutoMessageToday || 200;
  const autoMessageRemaining = Math.max(
    0,
    autoMessageDailyLimit - autoMessagesToday
  );
  const autoMessageProgress =
    autoMessageDailyLimit > 0
      ? (autoMessagesToday / autoMessageDailyLimit) * 100
      : 0;

  return (
    <>
      <div className="mb-6">
        <CollapsibleSection
          title="Thống kê hôm nay"
          icon={BarChart3}
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="space-y-4 pt-2">
            {/* Scan Statistics Section */}
            <div>
              <div className="mb-2.5 flex items-center gap-1.5">
                <div className="h-0.5 w-0.5 rounded-full bg-blue-600"></div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Thống kê quét số
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="mb-0.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        Tự động
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        Quét tự động
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleOpenDetails("auto")}
                      disabled={!stats.dailyScanCount}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Chi tiết
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricTile
                      label="Đã quét"
                      value={stats.dailyScanCount}
                      subLabel={`/ ${stats.maxScansPerDay}`}
                      accentClass="text-blue-700"
                    />
                    <MetricTile
                      label="Còn lại"
                      value={stats.remaining}
                      accentClass="text-slate-700"
                    />
                    <MetricTile
                      label="Có thông tin"
                      value={todayWithInfo}
                      accentClass="text-green-600"
                    />
                    <MetricTile
                      label="Không có"
                      value={todayWithoutInfo}
                      accentClass="text-orange-500"
                    />
                  </div>
                  <div className="mt-3">
                    <div className="mb-0.5 flex items-center justify-between text-[10px] font-medium text-gray-600">
                      <span>Tiến độ</span>
                      <span className="text-blue-700">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.min(progressPercentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="mb-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        Thủ công
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        Quét thủ công
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleOpenDetails("manual")}
                      disabled={!stats.manualScanCount}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Chi tiết
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricTile
                      label="Đã quét"
                      value={stats.manualScanCount}
                      accentClass="text-indigo-700"
                    />
                    <MetricTile
                      label="Tỉ lệ thành công"
                      value={
                        stats.manualScanCount > 0
                          ? `${Math.round(
                              (manualWithInfo / stats.manualScanCount) * 100
                            )}%`
                          : "0%"
                      }
                      accentClass="text-green-600"
                    />
                    <MetricTile
                      label="Có thông tin"
                      value={manualWithInfo}
                      accentClass="text-green-600"
                    />
                    <MetricTile
                      label="Không có"
                      value={manualWithoutInfo}
                      accentClass="text-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Friend Request Section */}
            <div>
              <div className="mb-2.5 flex items-center gap-1.5">
                <div className="h-0.5 w-0.5 rounded-full bg-indigo-600"></div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Lời mời kết bạn
                </h3>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <span className="mb-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                      Thủ công
                    </span>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">
                      Lời mời kết bạn
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleOpenFriendDetails("manual")}
                    disabled={!manualSentToday && !manualCanceledToday}
                  >
                    <Calendar className="mr-1 h-3 w-3" />
                    Chi tiết
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  <MetricTile
                    label="Đã gửi"
                    value={manualSentToday}
                    accentClass="text-indigo-700"
                  />
                  <MetricTile
                    label="Đã hủy"
                    value={manualCanceledToday}
                    accentClass="text-rose-600"
                  />
                  <MetricTile
                    label="Tổng gửi"
                    value={manualSentTotal}
                    accentClass="text-slate-700"
                  />
                  <MetricTile
                    label="Tổng hủy"
                    value={manualCanceledTotal}
                    accentClass="text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Message Section */}
            <div>
              <div className="mb-2.5 flex items-center gap-1.5">
                <div className="h-0.5 w-0.5 rounded-full bg-purple-600"></div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Gửi tin nhắn hàng loạt
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-3 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-1.5">
                    <div>
                      <span className="mb-0.5 inline-block rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        Tự động
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        Tin nhắn tự động
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {autoMessageDailyLimit}/ngày
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleOpenMessageDetails("auto")}
                        disabled={autoMessagesToday === 0}
                      >
                        <Calendar className="mr-1 h-3 w-3" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricTile
                      label="Đã gửi"
                      value={autoMessagesToday}
                      subLabel={`/ ${autoMessageDailyLimit}`}
                      accentClass="text-blue-700"
                    />
                    <MetricTile
                      label="Còn lại"
                      value={autoMessageRemaining}
                      accentClass="text-slate-700"
                    />
                    <MetricTile
                      label="Thành công"
                      value={autoSuccessCount}
                      accentClass="text-green-600"
                    />
                    <MetricTile
                      label="Thất bại"
                      value={autoFailedCount}
                      accentClass="text-rose-600"
                    />
                  </div>
                  <div className="mt-3">
                    <div className="mb-0.5 flex items-center justify-between text-[10px] font-medium text-gray-600">
                      <span>Tiến độ</span>
                      <span className="text-blue-700">
                        {autoMessageProgress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{
                          width: `${Math.min(autoMessageProgress, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <span className="mb-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                        Thủ công
                      </span>
                      <p className="mt-0.5 text-sm font-semibold text-gray-900">
                        Tin nhắn thủ công
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleOpenMessageDetails("manual")}
                      disabled={manualMessagesToday === 0}
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Chi tiết
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MetricTile
                      label="Đã gửi"
                      value={manualMessagesToday}
                      accentClass="text-indigo-700"
                    />
                    <MetricTile
                      label="Thành công"
                      value={manualSuccessCount}
                      accentClass="text-green-600"
                    />
                    <MetricTile
                      label="Thất bại"
                      value={manualFailedCount}
                      accentClass="text-rose-600"
                    />
                    <MetricTile
                      label="Tổng hôm nay"
                      value={manualMessagesToday}
                      accentClass="text-slate-700"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/50 p-2">
                <div className="flex items-start gap-1.5 text-xs text-blue-900">
                  <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-600" />
                  <span>
                    Hệ thống tự động quét và gửi tin nhắn trong khung giờ 9h-11h
                    và 14h-16h, cách nhau 30 phút. Không thể bật/tắt trong thời
                    gian này.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <DailyScanDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        accountId={accountId}
        mode={detailsMode}
      />
      <FriendRequestDetailsDialog
        open={isFriendDialogOpen}
        onOpenChange={setIsFriendDialogOpen}
        accountId={accountId}
        mode={friendDetailsMode}
      />
      <MessageDetailsDialog
        open={isMessageDialogOpen}
        onOpenChange={setIsMessageDialogOpen}
        accountId={accountId}
        mode={messageDetailsMode}
      />
    </>
  );
}
// [content truncated]
