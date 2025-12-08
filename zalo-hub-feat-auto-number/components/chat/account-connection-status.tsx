"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/use-socket";
import { useChatContext } from "@/lib/contexts/chat-context";

interface AccountConnectionStatusProps {
  accountId: number;
  showLabel?: boolean;
}

export function AccountConnectionStatus({
  accountId,
  showLabel = true,
}: AccountConnectionStatusProps) {
  const { getAccountStatus, isAccountConnected } = useSocket();
  const { selectedAccounts } = useChatContext();

  const status = getAccountStatus(accountId);
  const isConnected = isAccountConnected(accountId);
  const isSelected = selectedAccounts.includes(accountId.toString());

  const getStatusColor = () => {
    if (!isSelected) return "bg-gray-100 text-gray-500";
    if (isConnected) return "bg-green-100 text-green-700";
    if (status === "connecting") return "bg-yellow-100 text-yellow-700";
    if (status === "error") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
  };

  const getStatusText = () => {
    if (!isSelected) return "Không được chọn";
    if (isConnected) return "Đã kết nối";
    if (status === "connecting") return "Đang kết nối...";
    if (status === "error") return "Lỗi kết nối";
    if (status === "disconnected") return "Đã ngắt kết nối";
    return "Không xác định";
  };

  const getStatusIcon = () => {
    if (!isSelected) return "○";
    if (isConnected) return "●";
    if (status === "connecting") return "⟳";
    if (status === "error") return "✕";
    return "○";
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="secondary"
        className={`${getStatusColor()} text-xs font-medium`}
      >
        <span className="mr-1">{getStatusIcon()}</span>
        {showLabel && getStatusText()}
      </Badge>
    </div>
  );
}

interface MultiAccountConnectionStatusProps {
  accountIds: number[];
  showDetails?: boolean;
}

export function MultiAccountConnectionStatus({
  accountIds,
  showDetails = false,
}: MultiAccountConnectionStatusProps) {
  const { getAccountsStatus, connectedAccounts } = useSocket();
  const { selectedAccounts } = useChatContext();

  const statuses = getAccountsStatus(accountIds);
  const selectedAccountIds = selectedAccounts.map((id) => parseInt(id));

  const connectedCount = accountIds.filter(
    (id) => selectedAccountIds.includes(id) && connectedAccounts.includes(id)
  ).length;

  const totalSelected = accountIds.filter((id) =>
    selectedAccountIds.includes(id)
  ).length;

  const getOverallStatus = () => {
    if (totalSelected === 0) return "none";
    if (connectedCount === totalSelected) return "all";
    if (connectedCount > 0) return "partial";
    return "none";
  };

  const getStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case "all":
        return "bg-green-100 text-green-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      case "none":
        return "bg-gray-100 text-gray-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusText = () => {
    const status = getOverallStatus();
    switch (status) {
      case "all":
        return `Tất cả đã kết nối (${connectedCount}/${totalSelected})`;
      case "partial":
        return `Một số đã kết nối (${connectedCount}/${totalSelected})`;
      case "none":
        return `Chưa kết nối (${connectedCount}/${totalSelected})`;
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="space-y-2">
      <Badge
        variant="secondary"
        className={`${getStatusColor()} text-xs font-medium`}
      >
        {getStatusText()}
      </Badge>

      {showDetails && (
        <div className="space-y-1">
          {accountIds.map((accountId) => (
            <div
              key={accountId}
              className="flex items-center justify-between text-xs"
            >
              <span>Tài khoản {accountId}:</span>
              <AccountConnectionStatus
                accountId={accountId}
                showLabel={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
