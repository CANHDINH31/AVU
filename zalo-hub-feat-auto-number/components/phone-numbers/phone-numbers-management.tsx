"use client";

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  startTransition,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

import {
  Phone,
  Loader2,
  Upload,
  Users,
  Download,
  ArrowLeft,
} from "lucide-react";
import {
  phoneNumbersApi,
  PhoneNumber,
  PhoneNumberMessage,
  CreatePhoneNumberDto,
  UpdatePhoneNumberDto,
} from "@/lib/api/phone-numbers";
import { accountApi } from "@/lib/api/account";
import { Account } from "@/lib/types/account";
import { toast as sonnerToast } from "sonner";
import {
  PhoneNumbersSearchFilters,
  FriendFilterOption,
  FriendRequestFilterOption,
  ScanStatusOption,
  ScanSortOrder,
  HasScanInfoFilterOption,
  MessageFilterOption,
  LastMessageStatusFilterOption,
} from "./PhoneNumbersSearchFilters";
import { PhoneNumberTable } from "./PhoneNumberTable";
import { Progress } from "@/components/ui/progress";
import { PhoneNumberPagination } from "./PhoneNumberPagination";
import { PhoneNumberCreateDialog } from "./PhoneNumberCreateDialog";
import { PhoneNumberEditDialog } from "./PhoneNumberEditDialog";
import { PhoneNumberDeleteDialog } from "./PhoneNumberDeleteDialog";
import { PhoneNumberDeleteManyDialog } from "./PhoneNumberDeleteManyDialog";
import { PhoneNumberDetailDialog } from "./PhoneNumberDetailDialog";
import { PhoneNumberScanDialog } from "./PhoneNumberScanDialog";
import { PhoneNumberScanTypeDialog } from "./PhoneNumberScanTypeDialog";
import { PhoneNumberSendMessageDialog } from "./PhoneNumberSendMessageDialog";
import { DailyScanStatisticsCard } from "./DailyScanStatisticsCard";
import { PhoneNumberBulkActions } from "./PhoneNumberBulkActions";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500] as const;
const AUTO_SCAN_WINDOW = { startHour: 8, endHour: 12 };

type ToastVariant = "default" | "destructive" | "success";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

const toast = ({
  title,
  description,
  variant = "default",
  duration,
}: ToastOptions) => {
  const handler =
    variant === "destructive"
      ? sonnerToast.error
      : variant === "success"
      ? sonnerToast.success
      : sonnerToast;
  handler(title, { description, duration });
};

const convertLocalDateTimeToIso = (
  value: string | null
): string | undefined => {
  if (!value) {
    return undefined;
  }
  const [datePart, timePartRaw] = value.split("T");
  if (!datePart || !timePartRaw) {
    return undefined;
  }
  const normalizedTime =
    timePartRaw.length === 5 ? `${timePartRaw}:00` : timePartRaw;
  const date = new Date(`${datePart}T${normalizedTime}`);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)
    .toString()
    .padStart(2, "0");
  const offsetMins = (Math.abs(offsetMinutes) % 60).toString().padStart(2, "0");
  return `${datePart}T${normalizedTime}${sign}${offsetHours}:${offsetMins}`;
};

type PhoneRow = PhoneNumber & {
  lastMessage?: PhoneNumberMessage | null;
};

interface PhoneNumbersManagementProps {
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
}

export function PhoneNumbersManagement({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenUploads,
  onLogout,
}: PhoneNumbersManagementProps) {
  // Local filter states (not calling API immediately)
  const [searchInput, setSearchInput] = useState("");
  const [friendFilterInput, setFriendFilterInput] =
    useState<FriendFilterOption>("all");
  const [friendRequestFilterInput, setFriendRequestFilterInput] =
    useState<FriendRequestFilterOption>("all");
  const [scanStatusInput, setScanStatusInput] =
    useState<ScanStatusOption>("all");
  const [scanSortOrderInput, setScanSortOrderInput] =
    useState<ScanSortOrder>("desc");
  const [scannedFromInput, setScannedFromInput] = useState("");
  const [scannedToInput, setScannedToInput] = useState("");
  const [minScanCountInput, setMinScanCountInput] = useState("");
  const [maxScanCountInput, setMaxScanCountInput] = useState("");
  const [hasScanInfoFilterInput, setHasScanInfoFilterInput] =
    useState<HasScanInfoFilterOption>("all");
  const [hasMessageFilterInput, setHasMessageFilterInput] =
    useState<MessageFilterOption>("all");
  const [lastMessageFromInput, setLastMessageFromInput] = useState("");
  const [lastMessageToInput, setLastMessageToInput] = useState("");
  const [lastMessageStatusFilterInput, setLastMessageStatusFilterInput] =
    useState<LastMessageStatusFilterOption>("all");
  const [createdFromInput, setCreatedFromInput] = useState("");
  const [createdToInput, setCreatedToInput] = useState("");

  // Actual filter states (used in API query)
  const [searchQuery, setSearchQuery] = useState("");
  const [friendFilter, setFriendFilter] = useState<FriendFilterOption>("all");
  const [friendRequestFilter, setFriendRequestFilter] =
    useState<FriendRequestFilterOption>("all");
  const [scanStatus, setScanStatus] = useState<ScanStatusOption>("all");
  const [scanSortOrder, setScanSortOrder] = useState<ScanSortOrder>("desc");
  const [scannedFrom, setScannedFrom] = useState("");
  const [scannedTo, setScannedTo] = useState("");
  const [minScanCount, setMinScanCount] = useState("");
  const [maxScanCount, setMaxScanCount] = useState("");
  const [hasScanInfoFilter, setHasScanInfoFilter] =
    useState<HasScanInfoFilterOption>("all");
  const [hasMessageFilter, setHasMessageFilter] =
    useState<MessageFilterOption>("all");
  const [lastMessageFrom, setLastMessageFrom] = useState("");
  const [lastMessageTo, setLastMessageTo] = useState("");
  const [lastMessageStatusFilter, setLastMessageStatusFilter] =
    useState<LastMessageStatusFilterOption>("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteManyDialogOpen, setIsDeleteManyDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CreatePhoneNumberDto>({
    phoneNumber: "",
    name: "",
    notes: "",
    accountId: undefined,
  });
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isScanDialogOpen, setIsScanDialogOpen] = useState(false);
  const [isScanTypeDialogOpen, setIsScanTypeDialogOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  );
  const [currentAccountId, setCurrentAccountId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<
    "scan" | "send-friend-request" | "sync-friends" | "send-messages"
  >("scan");
  const [isSendMessageDialogOpen, setIsSendMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [detailPhone, setDetailPhone] = useState<PhoneNumber | null>(null);
  const [filtersCollapsed, setFiltersCollapsed] = useState(true);
  const [isAutoFriendRequestEnabled, setIsAutoFriendRequestEnabled] =
    useState(false);
  const [autoFriendRequestStartTime, setAutoFriendRequestStartTime] =
    useState("09:00");
  const [autoFriendRequestStartTimeInput, setAutoFriendRequestStartTimeInput] =
    useState("09:00");
  const [isTogglingAutoFriendRequest, setIsTogglingAutoFriendRequest] =
    useState(false);
  const [isAutoMessageEnabled, setIsAutoMessageEnabled] = useState(false);
  const [isTogglingAutoMessage, setIsTogglingAutoMessage] = useState(false);
  const [bulkMessageContent, setBulkMessageContent] = useState("");
  const [bulkMessageContentInput, setBulkMessageContentInput] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const accountIdFromQuery = searchParams.get("accountId");

  const updateAccountIdInUrl = useCallback(
    (accountId: number | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (accountId) {
        params.set("accountId", accountId.toString());
      } else {
        params.delete("accountId");
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const queryClient = useQueryClient();

  // Get accounts for scanning
  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => accountApi.me(),
    staleTime: 30_000,
  });

  const currentAccount = useMemo<Account | null>(() => {
    if (!currentAccountId) return null;
    return accounts.find((account) => account.id === currentAccountId) ?? null;
  }, [accounts, currentAccountId]);

  // Sync account selection from URL
  useEffect(() => {
    if (!accountIdFromQuery) {
      return;
    }
    const parsed = Number(accountIdFromQuery);
    if (!Number.isNaN(parsed) && parsed !== currentAccountId) {
      setCurrentAccountId(parsed);
    }
  }, [accountIdFromQuery, currentAccountId]);

  // Set default account if only one account exists
  useEffect(() => {
    if (!accountIdFromQuery && accounts.length === 1 && !currentAccountId) {
      const defaultAccountId = accounts[0].id;
      setCurrentAccountId(defaultAccountId);
      updateAccountIdInUrl(defaultAccountId);
    }
  }, [accounts, currentAccountId, accountIdFromQuery, updateAccountIdInUrl]);

  useEffect(() => {
    if (!currentAccount) {
      setIsAutoFriendRequestEnabled(false);
      setAutoFriendRequestStartTime("09:00");
      setAutoFriendRequestStartTimeInput("09:00");
      setIsAutoMessageEnabled(false);
      setBulkMessageContent("");
      setBulkMessageContentInput("");
      return;
    }

    const friendTime = currentAccount.friendRequestStartTime || "09:00";
    setIsAutoFriendRequestEnabled(
      Boolean(currentAccount.autoFriendRequestEnabled)
    );
    setAutoFriendRequestStartTime(friendTime);
    setAutoFriendRequestStartTimeInput(friendTime);

    setIsAutoMessageEnabled(Boolean(currentAccount.autoMessageEnabled));

    const messageContent = currentAccount.bulkMessageContent || "";
    setBulkMessageContent(messageContent);
    setBulkMessageContentInput(messageContent);
  }, [currentAccount]);

  useEffect(() => {
    if (scannedFrom && scannedTo) {
      const fromDate = new Date(scannedFrom);
      const toDate = new Date(scannedTo);
      if (
        !Number.isNaN(fromDate.getTime()) &&
        !Number.isNaN(toDate.getTime()) &&
        fromDate > toDate
      ) {
        setScannedTo(scannedFrom);
      }
    }
  }, [scannedFrom, scannedTo]);

  useEffect(() => {
    if (lastMessageFrom && lastMessageTo) {
      const fromDate = new Date(lastMessageFrom);
      const toDate = new Date(lastMessageTo);
      if (
        !Number.isNaN(fromDate.getTime()) &&
        !Number.isNaN(toDate.getTime()) &&
        fromDate > toDate
      ) {
        setLastMessageTo(lastMessageFrom);
      }
    }
  }, [lastMessageFrom, lastMessageTo]);

  useEffect(() => {
    if (createdFrom && createdTo) {
      const fromDate = new Date(createdFrom);
      const toDate = new Date(createdTo);
      if (
        !Number.isNaN(fromDate.getTime()) &&
        !Number.isNaN(toDate.getTime()) &&
        fromDate > toDate
      ) {
        setCreatedTo(createdFrom);
      }
    }
  }, [createdFrom, createdTo]);

  // Queries
  const friendFilterValue =
    friendFilter === "friend"
      ? true
      : friendFilter === "notFriend"
      ? false
      : undefined;
  const friendRequestFilterValue =
    friendRequestFilter === "sent"
      ? 1
      : friendRequestFilter === "notSent"
      ? 0
      : undefined;
  const scanStatusValue = scanStatus === "all" ? undefined : scanStatus;
  const scannedFromIso = convertLocalDateTimeToIso(scannedFrom || null);
  const scannedToIso = convertLocalDateTimeToIso(scannedTo || null);
  const minScanCountValue = useMemo(() => {
    if (minScanCount.trim() === "") {
      return undefined;
    }
    const parsed = Number(minScanCount);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [minScanCount]);
  const maxScanCountValue = useMemo(() => {
    if (maxScanCount.trim() === "") {
      return undefined;
    }
    const parsed = Number(maxScanCount);
    return Number.isNaN(parsed) ? undefined : parsed;
  }, [maxScanCount]);
  const hasScanInfoValue = useMemo(() => {
    if (hasScanInfoFilter === "all") {
      return undefined;
    }
    return hasScanInfoFilter === "hasInfo";
  }, [hasScanInfoFilter]);
  const hasMessageValue = useMemo(() => {
    if (hasMessageFilter === "all") {
      return undefined;
    }
    return hasMessageFilter === "hasMessage";
  }, [hasMessageFilter]);
  const lastMessageFromIso = convertLocalDateTimeToIso(lastMessageFrom || null);
  const lastMessageToIso = convertLocalDateTimeToIso(lastMessageTo || null);
  const createdFromIso = convertLocalDateTimeToIso(createdFrom || null);
  const createdToIso = convertLocalDateTimeToIso(createdTo || null);

  const { data, isLoading } = useQuery({
    queryKey: [
      "phone-numbers",
      page,
      pageSize,
      searchQuery,
      currentAccountId,
      friendFilter,
      friendRequestFilter,
      scanStatus,
      scannedFromIso,
      scannedToIso,
      createdFromIso,
      createdToIso,
      scanSortOrder,
      minScanCountValue,
      maxScanCountValue,
      hasScanInfoFilter,
      hasMessageFilter,
      lastMessageFromIso,
      lastMessageToIso,
      lastMessageStatusFilter,
    ],
    queryFn: () =>
      phoneNumbersApi.getAll({
        page,
        pageSize,
        search: searchQuery,
        accountId: currentAccountId ?? undefined,
        isFriend: friendFilterValue,
        hasSentFriendRequest: friendRequestFilterValue,
        scannedStatus: scanStatusValue,
        scannedFrom: scannedFromIso,
        scannedTo: scannedToIso,
        createdFrom: createdFromIso,
        createdTo: createdToIso,
        sortBy: "lastScannedAt",
        sortOrder: scanSortOrder,
        minScanCount:
          typeof minScanCountValue === "number" &&
          !Number.isNaN(minScanCountValue)
            ? minScanCountValue
            : undefined,
        maxScanCount:
          typeof maxScanCountValue === "number" &&
          !Number.isNaN(maxScanCountValue)
            ? maxScanCountValue
            : undefined,
        hasScanInfo: hasScanInfoValue,
        hasMessage: hasMessageValue,
        lastMessageFrom: lastMessageFromIso,
        lastMessageTo: lastMessageToIso,
        lastMessageStatus:
          lastMessageStatusFilter !== "all"
            ? lastMessageStatusFilter
            : undefined,
      }),
    placeholderData: (previousData) => previousData,
  });
  const phoneRows = useMemo<PhoneRow[]>(() => {
    return (data?.data ?? []).map((phone) => {
      const sortedMessages = [...(phone.messageHistory ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        ...phone,
        messageHistory: sortedMessages,
        lastMessage: sortedMessages[0] ?? null,
      };
    });
  }, [data?.data]);

  // Memoize phone IDs for better performance when selecting all
  const phoneIds = useMemo(() => {
    const ids: number[] = [];
    for (const phone of phoneRows) {
      if (phone.id) {
        ids.push(phone.id);
      }
    }
    return ids;
  }, [phoneRows]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: phoneNumbersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setIsCreateDialogOpen(false);
      setFormData({
        phoneNumber: "",
        name: "",
        notes: "",
        accountId: undefined,
      });
      toast({
        title: "Thành công",
        description: "Tạo số điện thoại thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Tạo số điện thoại thất bại",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePhoneNumberDto }) =>
      phoneNumbersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setIsEditDialogOpen(false);
      setSelectedPhone(null);
      setFormData({
        phoneNumber: "",
        name: "",
        notes: "",
        accountId: undefined,
      });
      toast({
        title: "Thành công",
        description: "Cập nhật số điện thoại thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Cập nhật số điện thoại thất bại",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: phoneNumbersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setIsDeleteDialogOpen(false);
      setSelectedPhone(null);
      toast({
        title: "Thành công",
        description: "Xóa số điện thoại thành công",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Xóa số điện thoại thất bại",
        variant: "destructive",
      });
    },
  });

  const deleteManyMutation = useMutation({
    mutationFn: phoneNumbersApi.deleteMany,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setSelectedIds(new Set());

      const errorMessages =
        result.errors && result.errors.length > 0
          ? `\n\nChi tiết:\n${result.errors.join("\n")}`
          : "";

      const invalidIdsMessage =
        result.invalidIds && result.invalidIds.length > 0
          ? `\nID không hợp lệ: ${result.invalidIds.join(", ")}`
          : "";

      toast({
        title: result.failed > 0 ? "Xóa hoàn tất" : "Xóa thành công",
        description: `${result.message}${errorMessages}${invalidIdsMessage}`,
        variant: result.failed > 0 ? "default" : "default",
        duration: result.errors && result.errors.length > 0 ? 10000 : 5000,
      });
    },
    onError: (error: any) => {
      // Try to parse error response
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Xóa số điện thoại thất bại";

      const errorDetails =
        error.response?.data?.errors?.join("\n") ||
        error.response?.data?.error?.join("\n") ||
        "";

      toast({
        title: "Lỗi",
        description: errorMessage + (errorDetails ? `\n\n${errorDetails}` : ""),
        variant: "destructive",
        duration: errorDetails ? 10000 : 5000,
      });
    },
  });

  const { data: dailyScanStats, isFetching: isDailyScanLoading } = useQuery({
    queryKey: ["daily-scan-statistics", currentAccountId],
    queryFn: () => phoneNumbersApi.getDailyStatistics(currentAccountId!),
    enabled: !!currentAccountId,
    staleTime: 30_000,
  });

  const toggleAutoScanMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!currentAccountId) {
        throw new Error("Vui lòng chọn tài khoản trước");
      }
      return await phoneNumbersApi.toggleDailyScan(currentAccountId, enabled);
    },
    onSuccess: async (result) => {
      toast({
        title: result.scanEnabled
          ? "Đã bật tự động quét"
          : "Đã tắt tự động quét",
        description: result.message,
      });
      await queryClient.invalidateQueries({
        queryKey: ["daily-scan-statistics", currentAccountId],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description:
          error?.message ||
          "Không thể cập nhật trạng thái quét tự động vào lúc này",
        variant: "destructive",
      });
    },
  });

  const importExcelMutation = useMutation({
    mutationFn: ({ file, accountId }: { file: File; accountId: number }) =>
      phoneNumbersApi.importExcel(file, accountId),
    onSuccess: (result) => {
      setUploadProgress(100);
      setTimeout(() => {
        setExcelFile(null);
        setUploadProgress(0);
      }, 1500);

      toast({
        title: "Đã nhận file",
        description: result.message,
        variant: "default",
        duration: 8000,
      });

      // Invalidate queries after a delay to allow processing
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      }, 5000);
    },
    onError: (error: any) => {
      setUploadProgress(0);
      setExcelFile(null);
      toast({
        title: "Lỗi",
        description: error.message || "Import Excel thất bại",
        variant: "destructive",
      });
    },
  });

  const scanPhoneNumbersMutation = useMutation({
    mutationFn: ({ ids, accountId }: { ids: number[]; accountId: number }) =>
      phoneNumbersApi.scanPhoneNumbers(ids, accountId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      toast({
        title: "Quét nhanh đã được gửi",
        description: `Kết quả: ${JSON.stringify(result)}`,
        duration: 5000,
      });
      setIsScanTypeDialogOpen(false);
      setSelectedAccountId(null);
      setSelectedIds(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Quét thông tin thất bại",
        variant: "destructive",
      });
    },
  });

  const scanPhoneNumbersWithQueueMutation = useMutation({
    mutationFn: ({ ids, accountId }: { ids: number[]; accountId: number }) =>
      phoneNumbersApi.scanPhoneNumbersWithQueue(ids, accountId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setIsScanTypeDialogOpen(false);
      setSelectedIds(new Set());

      toast({
        title: "Đã thêm vào queue",
        description: result.message,
        duration: 8000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Thêm vào queue thất bại",
        variant: "destructive",
      });
    },
  });

  const scanAllPhoneNumbersWithQueueMutation = useMutation({
    mutationFn: ({ accountId }: { accountId: number }) =>
      phoneNumbersApi.scanAllPhoneNumbersWithQueue(accountId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setIsScanTypeDialogOpen(false);
      setSelectedIds(new Set());

      toast({
        title: "Đã thêm vào queue",
        description: result.message,
        duration: 8000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Thêm vào queue thất bại",
        variant: "destructive",
      });
    },
  });

  const syncFriendsMutation = useMutation({
    mutationFn: (accountId: number) => phoneNumbersApi.syncFriends(accountId),
    onSuccess: async (result, accountId) => {
      // After sync success, check and update friend status
      try {
        await phoneNumbersApi.checkAndUpdateFriendStatus(accountId);
        queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
        setIsScanDialogOpen(false);
        setSelectedAccountId(null);
        toast({
          title: "Thành công",
          description: `${result.message}. Đã cập nhật trạng thái bạn bè.`,
        });
      } catch (error: any) {
        // Still show success for sync, but warn about status update
        queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
        setIsScanDialogOpen(false);
        setSelectedAccountId(null);
        toast({
          title: "Đồng bộ thành công",
          description: `${result.message}. Lưu ý: ${error.message}`,
          variant: "default",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Đồng bộ bạn bè thất bại",
        variant: "destructive",
      });
    },
  });

  const sendFriendRequestsMutation = useMutation({
    mutationFn: ({ ids, accountId }: { ids: number[]; accountId: number }) =>
      phoneNumbersApi.sendFriendRequests(ids, accountId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setSelectedIds(new Set());

      const errorMessages =
        result.errors && result.errors.length > 0
          ? `\n\nLỗi chi tiết:\n${result.errors.slice(0, 5).join("\n")}${
              result.errors.length > 5
                ? `\n... và ${result.errors.length - 5} lỗi khác`
                : ""
            }`
          : "";

      toast({
        title:
          result.failed > 0
            ? "Gửi lời mời hoàn tất"
            : "Gửi lời mời kết bạn thành công",
        description: `Thành công: ${result.success}${
          result.failed > 0 ? `, Thất bại: ${result.failed}` : ""
        }${errorMessages}`,
        variant: result.failed > 0 ? "default" : "default",
        duration: result.errors && result.errors.length > 0 ? 10000 : 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Gửi lời mời kết bạn thất bại",
        variant: "destructive",
      });
    },
  });

  const undoFriendRequestsMutation = useMutation({
    mutationFn: ({ ids, accountId }: { ids: number[]; accountId: number }) =>
      phoneNumbersApi.undoFriendRequests(ids, accountId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setSelectedIds(new Set());

      const errorMessages =
        result.errors && result.errors.length > 0
          ? `\n\nLỗi chi tiết:\n${result.errors.slice(0, 5).join("\n")}${
              result.errors.length > 5
                ? `\n... và ${result.errors.length - 5} lỗi khác`
                : ""
            }`
          : "";

      toast({
        title:
          result.failed > 0
            ? "Thu hồi lời mời hoàn tất"
            : "Thu hồi lời mời thành công",
        description: `Thành công: ${result.success}${
          result.failed > 0 ? `, Thất bại: ${result.failed}` : ""
        }${errorMessages}`,
        variant: result.failed > 0 ? "default" : "default",
        duration: result.errors && result.errors.length > 0 ? 10000 : 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Thu hồi lời mời kết bạn thất bại",
        variant: "destructive",
      });
    },
  });

  const sendBulkMessagesMutation = useMutation({
    mutationFn: ({
      ids,
      accountId,
      message,
    }: {
      ids: number[];
      accountId: number;
      message: string;
    }) => phoneNumbersApi.sendBulkMessages(ids, accountId, message),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["phone-numbers"] });
      setIsSendMessageDialogOpen(false);
      setMessageContent("");
      setSelectedIds(new Set());

      const errorMessages =
        result.errors && result.errors.length > 0
          ? `\n\nLỗi chi tiết:\n${result.errors.slice(0, 5).join("\n")}${
              result.errors.length > 5
                ? `\n... và ${result.errors.length - 5} lỗi khác`
                : ""
            }`
          : "";

      toast({
        title:
          result.failed > 0
            ? "Gửi tin nhắn hoàn tất"
            : "Gửi tin nhắn hàng loạt thành công",
        description: `Thành công: ${result.success}${
          result.failed > 0 ? `, Thất bại: ${result.failed}` : ""
        }${errorMessages}`,
        variant: result.failed > 0 ? "default" : "default",
        duration: result.errors && result.errors.length > 0 ? 10000 : 5000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Gửi tin nhắn hàng loạt thất bại",
        variant: "destructive",
      });
    },
  });

  // Progress simulation effect
  useEffect(() => {
    if (importExcelMutation.isPending && excelFile) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [importExcelMutation.isPending, excelFile]);

  // Handlers
  const handleCreate = () => {
    if (!formData.phoneNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ ...formData, accountId: currentAccountId });
  };

  const handleUpdate = () => {
    if (!selectedPhone || !formData.phoneNumber.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số điện thoại",
        variant: "destructive",
      });
      return;
    }
    if (!currentAccountId && !formData.accountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate({
      id: selectedPhone.id!,
      data: {
        ...formData,
        accountId: formData.accountId || currentAccountId || undefined,
      },
    });
  };

  const handleDelete = useCallback((phone: PhoneNumber) => {
    setSelectedPhone(phone);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleViewDetails = useCallback((phone: PhoneNumber) => {
    setDetailPhone(phone);
    setIsDetailDialogOpen(true);
  }, []);

  const handleConfirmDelete = () => {
    if (selectedPhone) {
      deleteMutation.mutate(selectedPhone.id!);
    }
  };

  const handleSelectAll = useCallback(() => {
    if (phoneIds.length === 0) {
      return;
    }
    // Use startTransition to prioritize UI responsiveness
    startTransition(() => {
      setSelectedIds((prev) => {
        // Quick check: if sizes match, verify all IDs are present
        if (prev.size === phoneIds.length) {
          // Check if all IDs are selected (optimized: early exit if any missing)
          for (let i = 0; i < phoneIds.length; i++) {
            if (!prev.has(phoneIds[i])) {
              // Not all selected, select all
              return new Set(phoneIds);
            }
          }
          // All selected, deselect all
          return new Set();
        }
        // Not all selected, select all
        return new Set(phoneIds);
      });
    });
  }, [phoneIds]);

  const handleSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleImportExcel = () => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước khi import",
        variant: "destructive",
      });
      return;
    }

    const accountId = currentAccountId;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx,.xls";
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setExcelFile(file);
        importExcelMutation.mutate({ file, accountId });
      }
    };
    fileInput.click();
  };

  const handleSearchInputChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    // Update all actual filter states from input states
    setSearchQuery(searchInput);
    setFriendFilter(friendFilterInput);
    setFriendRequestFilter(friendRequestFilterInput);
    setScanStatus(scanStatusInput);
    setScanSortOrder(scanSortOrderInput);
    setScannedFrom(scannedFromInput);
    setScannedTo(scannedToInput);
    setCreatedFrom(createdFromInput);
    setCreatedTo(createdToInput);
    setMinScanCount(minScanCountInput);
    setMaxScanCount(maxScanCountInput);
    setHasScanInfoFilter(hasScanInfoFilterInput);
    setHasMessageFilter(hasMessageFilterInput);
    setLastMessageFrom(lastMessageFromInput);
    setLastMessageTo(lastMessageToInput);
    setLastMessageStatusFilter(lastMessageStatusFilterInput);
    setPage(1);
    setSelectedIds(new Set());
  }, [
    searchInput,
    friendFilterInput,
    friendRequestFilterInput,
    scanStatusInput,
    scanSortOrderInput,
    scannedFromInput,
    scannedToInput,
    minScanCountInput,
    maxScanCountInput,
    hasScanInfoFilterInput,
    hasMessageFilterInput,
    lastMessageStatusFilterInput,
    lastMessageFromInput,
    lastMessageToInput,
    createdFromInput,
    createdToInput,
  ]);

  const handleFriendFilterChange = useCallback((value: FriendFilterOption) => {
    setFriendFilterInput(value);
  }, []);

  const handleFriendRequestFilterChange = useCallback(
    (value: FriendRequestFilterOption) => {
      setFriendRequestFilterInput(value);
    },
    []
  );

  const handleScanStatusChange = useCallback((value: ScanStatusOption) => {
    setScanStatusInput(value);
  }, []);

  const handleScanSortOrderChange = useCallback((value: ScanSortOrder) => {
    setScanSortOrderInput(value);
  }, []);

  const handleScannedFromChange = useCallback((value: string) => {
    setScannedFromInput(value);
  }, []);

  const handleScannedToChange = useCallback((value: string) => {
    setScannedToInput(value);
  }, []);

  const handleCreatedFromChange = useCallback((value: string) => {
    setCreatedFromInput(value);
  }, []);

  const handleCreatedToChange = useCallback((value: string) => {
    setCreatedToInput(value);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const handleMinScanCountChange = useCallback((value: string) => {
    setMinScanCountInput(value);
  }, []);

  const handleMaxScanCountChange = useCallback((value: string) => {
    setMaxScanCountInput(value);
  }, []);

  const handleHasScanInfoFilterChange = useCallback(
    (value: HasScanInfoFilterOption) => {
      setHasScanInfoFilterInput(value);
    },
    []
  );

  const handleHasMessageFilterChange = useCallback(
    (value: MessageFilterOption) => {
      setHasMessageFilterInput(value);
    },
    []
  );

  const handleLastMessageFromChange = useCallback((value: string) => {
    setLastMessageFromInput(value);
  }, []);

  const handleLastMessageToChange = useCallback((value: string) => {
    setLastMessageToInput(value);
  }, []);

  const handleLastMessageStatusFilterChange = useCallback(
    (value: LastMessageStatusFilterOption) => {
      setLastMessageStatusFilterInput(value);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    // Clear input states
    setSearchInput("");
    setFriendFilterInput("all");
    setFriendRequestFilterInput("all");
    setScanStatusInput("all");
    setScanSortOrderInput("desc");
    setScannedFromInput("");
    setScannedToInput("");
    setCreatedFromInput("");
    setCreatedToInput("");
    setMinScanCountInput("");
    setMaxScanCountInput("");
    setHasScanInfoFilterInput("all");
    setHasMessageFilterInput("all");
    setLastMessageFromInput("");
    setLastMessageToInput("");
    setLastMessageStatusFilterInput("all");
    // Clear actual states and trigger API call
    setSearchQuery("");
    setFriendFilter("all");
    setFriendRequestFilter("all");
    setScanStatus("all");
    setScanSortOrder("desc");
    setScannedFrom("");
    setScannedTo("");
    setCreatedFrom("");
    setCreatedTo("");
    setMinScanCount("");
    setMaxScanCount("");
    setHasScanInfoFilter("all");
    setHasMessageFilter("all");
    setLastMessageFrom("");
    setLastMessageTo("");
    setLastMessageStatusFilter("all");
    setPage(1);
    setSelectedIds(new Set());
  }, []);

  const handleExportCsv = async () => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước khi export CSV",
        variant: "destructive",
      });
      return;
    }

    try {
      const blob = await phoneNumbersApi.exportCsv({
        search: searchQuery || undefined,
        accountId: currentAccountId,
        isFriend: friendFilterValue,
        hasSentFriendRequest: friendRequestFilterValue,
        scannedStatus: scanStatusValue,
        scannedFrom: scannedFromIso,
        scannedTo: scannedToIso,
        sortBy: "lastScannedAt",
        sortOrder: scanSortOrder,
        minScanCount: minScanCountValue,
        maxScanCount: maxScanCountValue,
        hasScanInfo: hasScanInfoValue,
        hasMessage: hasMessageValue,
        lastMessageFrom: lastMessageFromIso,
        lastMessageTo: lastMessageToIso,
        lastMessageStatus:
          lastMessageStatusFilter !== "all"
            ? lastMessageStatusFilter
            : undefined,
      });

      // Format filename with date and time: phone-numbers-YYYY-MM-DD-HHMMSS.csv
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const filename = `phone-numbers-${year}-${month}-${day}-${hours}${minutes}${seconds}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Đã xuất CSV",
        description: "Đã tải xuống file CSV với tất cả dữ liệu theo filter.",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Export CSV thất bại",
        variant: "destructive",
      });
    }
  };

  const handleScanPhoneNumbers = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    // Open scan type dialog
    setIsScanTypeDialogOpen(true);
  };

  const handleFastScan = () => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    scanPhoneNumbersMutation.mutate({
      ids: Array.from(selectedIds),
      accountId: currentAccountId,
    });
  };

  const handleSlowScan = () => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    scanPhoneNumbersWithQueueMutation.mutate({
      ids: Array.from(selectedIds),
      accountId: currentAccountId,
    });
  };

  const handleScanAll = () => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    scanAllPhoneNumbersWithQueueMutation.mutate({
      accountId: currentAccountId,
    });
  };

  const handleConfirmScan = () => {
    if (!selectedAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản để quét",
        variant: "destructive",
      });
      return;
    }

    scanPhoneNumbersMutation.mutate({
      ids: Array.from(selectedIds),
      accountId: selectedAccountId,
    });
  };

  const handleSyncFriends = () => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    syncFriendsMutation.mutate(currentAccountId);
  };

  const handleSendFriendRequests = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccountId) {
      // Open dialog to select account
      setDialogAction("send-friend-request");
      setSelectedAccountId(null);
      setIsScanDialogOpen(true);
      return;
    }

    // Filter selected phone numbers - only allow non-friends and not sent requests
    const selectedPhones = phoneRows.filter(
      (p) => p.id && selectedIds.has(p.id)
    );

    // Lọc ra những số chưa là bạn bè (isFriend = false hoặc undefined) và chưa gửi lời mời
    const validPhones = selectedPhones?.filter(
      (p) => !p.isFriend && p.hasSentFriendRequest !== 1 && p.id
    );

    if (!validPhones || validPhones.length === 0) {
      toast({
        title: "Lỗi",
        description:
          "Không có số điện thoại nào hợp lệ. Chỉ có thể gửi lời mời cho số chưa là bạn bè và chưa gửi lời mời.",
        variant: "destructive",
      });
      return;
    }

    sendFriendRequestsMutation.mutate({
      ids: validPhones.map((p) => p.id!),
      accountId: currentAccountId,
    });
  };

  const handleToggleAutoFriendRequest = async (enabled: boolean) => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }
    setIsTogglingAutoFriendRequest(true);
    try {
      await accountApi.updateSettings(currentAccountId, {
        autoFriendRequestEnabled: enabled,
        friendRequestStartTime: enabled
          ? autoFriendRequestStartTime
          : undefined,
      });
      setIsAutoFriendRequestEnabled(enabled);
      toast({
        title: enabled ? "Đã bật gửi tự động" : "Đã tắt gửi tự động",
        description: enabled
          ? `Hệ thống sẽ tự động gửi lời mời kết bạn bắt đầu từ ${autoFriendRequestStartTime}`
          : "Đã tắt chế độ gửi tự động",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật cài đặt",
        variant: "destructive",
      });
    } finally {
      setIsTogglingAutoFriendRequest(false);
    }
  };

  const handleAutoFriendRequestTimeInputChange = (time: string) => {
    setAutoFriendRequestStartTimeInput(time);
  };

  const handleAutoFriendRequestTimeChange = async (time: string) => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }
    try {
      await accountApi.updateSettings(currentAccountId, {
        friendRequestStartTime: time,
      });
      setAutoFriendRequestStartTime(time);
      setAutoFriendRequestStartTimeInput(time);
      toast({
        title: "Đã cập nhật thời gian",
        description: `Thời gian bắt đầu gửi tự động: ${time}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật thời gian",
        variant: "destructive",
      });
    }
  };

  // Check if current time is within message auto-scan windows (9h-10h30 or 14h-15h30)
  const isWithinMessageAutoScanWindow = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return (
      currentHour === 9 ||
      (currentHour === 10 && currentMinute <= 30) ||
      currentHour === 14 ||
      (currentHour === 15 && currentMinute <= 30)
    );
  }, []);

  const handleToggleAutoMessage = async (enabled: boolean) => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    // Prevent toggling during auto-scan windows
    if (isWithinMessageAutoScanWindow) {
      toast({
        title: "Không thể thay đổi",
        description:
          "Không thể bật/tắt gửi tin nhắn tự động trong khung giờ 9h-11h và 14h-16h",
        variant: "destructive",
      });
      return;
    }

    setIsTogglingAutoMessage(true);
    try {
      await accountApi.updateSettings(currentAccountId, {
        autoMessageEnabled: enabled,
        bulkMessageContent: enabled ? bulkMessageContent : undefined,
      });
      setIsAutoMessageEnabled(enabled);
      toast({
        title: enabled ? "Đã bật gửi tự động" : "Đã tắt gửi tự động",
        description: enabled
          ? "Hệ thống sẽ tự động gửi tin nhắn trong khung giờ 9h-10h30 và 14h-15h30, cách nhau 30 phút"
          : "Đã tắt chế độ gửi tự động",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật cài đặt",
        variant: "destructive",
      });
    } finally {
      setIsTogglingAutoMessage(false);
    }
  };

  const handleBulkMessageContentChange = (content: string) => {
    setBulkMessageContentInput(content);
  };

  const handleBulkMessageContentConfirm = async (content: string) => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }
    try {
      await accountApi.updateSettings(currentAccountId, {
        bulkMessageContent: content,
      });
      setBulkMessageContent(content);
      setBulkMessageContentInput(content);
      toast({
        title: "Đã lưu nội dung tin nhắn",
        description: "Nội dung tin nhắn đã được lưu thành công",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu nội dung tin nhắn",
        variant: "destructive",
      });
    }
  };

  const handleUndoFriendRequests = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }

    const selectedPhones = phoneRows.filter(
      (p) => p.id && selectedIds.has(p.id)
    );

    // Lọc ra những số đã gửi lời mời (hasSentFriendRequest === 1)
    const validPhones = selectedPhones?.filter(
      (p) => p.hasSentFriendRequest === 1
    );

    if (!validPhones || validPhones.length === 0) {
      toast({
        title: "Lỗi",
        description: "Không có số điện thoại nào đã gửi lời mời để thu hồi.",
        variant: "destructive",
      });
      return;
    }

    undoFriendRequestsMutation.mutate({
      ids: validPhones.map((p) => p.id!),
      accountId: currentAccountId,
    });
  };

  const handleSendBulkMessages = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một số điện thoại",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccountId) {
      setDialogAction("send-messages");
      setSelectedAccountId(null);
      setIsScanDialogOpen(true);
      return;
    }

    setDialogAction("send-messages");
    setSelectedAccountId(currentAccountId);
    setIsSendMessageDialogOpen(true);
  };

  const handleConfirmSendMessages = () => {
    if (!messageContent.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập nội dung tin nhắn",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản để gửi tin nhắn",
        variant: "destructive",
      });
      return;
    }

    // Filter selected phone numbers
    const selectedPhones = phoneRows.filter(
      (p) => p.id && selectedIds.has(p.id)
    );

    if (selectedPhones.length === 0) {
      toast({
        title: "Lỗi",
        description: `Không tìm thấy số điện thoại đã chọn trong danh sách hiện tại. Có thể bạn đã chuyển trang. Vui lòng chọn lại số điện thoại.`,
        variant: "destructive",
      });
      return;
    }

    // Gửi tất cả selected phones, backend sẽ validate và trả về lỗi cho những số không có uid
    sendBulkMessagesMutation.mutate({
      ids: selectedPhones.map((p) => p.id!),
      accountId: selectedAccountId,
      message: messageContent.trim(),
    });
  };

  const handleToggleAutoScan = (enabled: boolean) => {
    if (!currentAccountId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn tài khoản trước",
        variant: "destructive",
      });
      return;
    }
    toggleAutoScanMutation.mutate(enabled);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ít nhất một số điện thoại",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteManyDialogOpen(true);
  };

  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;
  const selectedCount = selectedIds.size;
  const isAnyScanMutationPending =
    scanPhoneNumbersMutation.isPending ||
    scanPhoneNumbersWithQueueMutation.isPending ||
    scanAllPhoneNumbersWithQueueMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Section with Account Selector & Actions */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Top Header Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {onBack && (
                  <Button variant="ghost" size="sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                  </Button>
                )}
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Quản lý số điện thoại khách hàng
                  </h1>
                  <p className="text-xs text-gray-600">
                    Quản lý danh sách số điện thoại và thông tin khách hàng
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Selector & Primary Actions */}
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <label
                  htmlFor="account-select"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Tài khoản:
                </label>
                <select
                  id="account-select"
                  className="flex-1 sm:flex-initial min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={currentAccountId || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const accountId = value ? Number(value) : null;
                    setCurrentAccountId(accountId);
                    updateAccountIdInUrl(accountId);
                  }}
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
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportExcel}
                  disabled={importExcelMutation.isPending || !currentAccountId}
                >
                  {importExcelMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCsv}
                  disabled={!currentAccountId}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSyncFriends}
                  disabled={syncFriendsMutation.isPending || !currentAccountId}
                >
                  {syncFriendsMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Đồng bộ bạn bè
                </Button>
              </div>
            </div>

            {syncFriendsMutation.isPending && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang đồng bộ danh sách bạn bè từ Zalo và cập nhật trạng thái...
              </div>
            )}
          </div>
        </div>

        {/* Upload Progress */}
        {importExcelMutation.isPending && excelFile && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Đang import file: {excelFile.name}
                </span>
              </div>
              <span className="text-sm text-blue-600 font-medium">
                {uploadProgress}%
              </span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Search Filters */}
        <div className="mb-6">
          <PhoneNumbersSearchFilters
            searchTerm={searchInput}
            onSearchInputChange={handleSearchInputChange}
            onSearchSubmit={handleSearchSubmit}
            friendFilter={friendFilterInput}
            friendRequestFilter={friendRequestFilterInput}
            onFriendFilterChange={handleFriendFilterChange}
            onFriendRequestFilterChange={handleFriendRequestFilterChange}
            scanStatus={scanStatusInput}
            scanSortOrder={scanSortOrderInput}
            scannedFrom={scannedFromInput}
            scannedTo={scannedToInput}
            createdFrom={createdFromInput}
            createdTo={createdToInput}
            onScanStatusChange={handleScanStatusChange}
            onScanSortOrderChange={handleScanSortOrderChange}
            onScannedFromChange={handleScannedFromChange}
            onScannedToChange={handleScannedToChange}
            onCreatedFromChange={handleCreatedFromChange}
            onCreatedToChange={handleCreatedToChange}
            minScanCount={minScanCountInput}
            maxScanCount={maxScanCountInput}
            hasScanInfoFilter={hasScanInfoFilterInput}
            onMinScanCountChange={handleMinScanCountChange}
            onMaxScanCountChange={handleMaxScanCountChange}
            onHasScanInfoFilterChange={handleHasScanInfoFilterChange}
            hasMessageFilter={hasMessageFilterInput}
            lastMessageFrom={lastMessageFromInput}
            lastMessageTo={lastMessageToInput}
            lastMessageStatusFilter={lastMessageStatusFilterInput}
            onHasMessageFilterChange={handleHasMessageFilterChange}
            onLastMessageFromChange={handleLastMessageFromChange}
            onLastMessageToChange={handleLastMessageToChange}
            onLastMessageStatusFilterChange={
              handleLastMessageStatusFilterChange
            }
            onClearFilters={handleClearFilters}
            isCollapsed={filtersCollapsed}
            onToggleCollapsed={() => setFiltersCollapsed((prev) => !prev)}
          />
        </div>
        {/* Daily Scan Statistics Card */}
        <DailyScanStatisticsCard accountId={currentAccountId} />

        <PhoneNumberBulkActions
          selectedCount={selectedCount}
          onScan={handleScanPhoneNumbers}
          onToggleAutoScan={handleToggleAutoScan}
          onSendFriendRequest={handleSendFriendRequests}
          onToggleAutoFriendRequest={handleToggleAutoFriendRequest}
          onAutoFriendRequestTimeInputChange={
            handleAutoFriendRequestTimeInputChange
          }
          onAutoFriendRequestTimeChange={handleAutoFriendRequestTimeChange}
          onUndoFriendRequest={handleUndoFriendRequests}
          onSendMessage={handleSendBulkMessages}
          onToggleAutoMessage={handleToggleAutoMessage}
          onBulkMessageContentChange={handleBulkMessageContentChange}
          onBulkMessageContentConfirm={handleBulkMessageContentConfirm}
          bulkMessageContent={bulkMessageContent}
          bulkMessageContentInput={bulkMessageContentInput}
          onDelete={handleBulkDelete}
          isScanning={isAnyScanMutationPending}
          isAutoScanEnabled={!!dailyScanStats?.scanEnabled}
          isTogglingAutoScan={toggleAutoScanMutation.isPending}
          isSendingFriendRequest={sendFriendRequestsMutation.isPending}
          isAutoFriendRequestEnabled={isAutoFriendRequestEnabled}
          isTogglingAutoFriendRequest={isTogglingAutoFriendRequest}
          autoFriendRequestStartTime={autoFriendRequestStartTime}
          autoFriendRequestStartTimeInput={autoFriendRequestStartTimeInput}
          isUndoingFriendRequest={undoFriendRequestsMutation.isPending}
          isSendingMessage={sendBulkMessagesMutation.isPending}
          isAutoMessageEnabled={isAutoMessageEnabled}
          isTogglingAutoMessage={isTogglingAutoMessage}
          isDeleting={deleteManyMutation.isPending}
          autoScanWindow={AUTO_SCAN_WINDOW}
          isWithinMessageAutoScanWindow={isWithinMessageAutoScanWindow}
        />

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : phoneRows.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không có số điện thoại nào
              </h3>
              <p className="text-gray-500">
                Bắt đầu bằng cách thêm số điện thoại mới hoặc import từ Excel
              </p>
            </div>
          ) : (
            <PhoneNumberTable
              phoneRows={phoneRows}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onViewDetails={handleViewDetails}
              onDelete={handleDelete}
            />
          )}
          <PhoneNumberPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            showPageSize={true}
            borderPosition="bottom"
            pageSizeOptions={PAGE_SIZE_OPTIONS}
          />
        </div>
      </div>

      {/* Create Dialog */}
      <PhoneNumberCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        currentAccountId={currentAccountId}
        accounts={accounts}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      {/* Detail Dialog */}
      <PhoneNumberDetailDialog
        open={isDetailDialogOpen}
        onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) {
            setDetailPhone(null);
          }
        }}
        phoneNumber={detailPhone}
      />

      {/* Edit Dialog */}
      <PhoneNumberEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        currentAccountId={currentAccountId}
        accounts={accounts}
        onSubmit={handleUpdate}
        isPending={updateMutation.isPending}
      />

      {/* Scan Type Dialog */}
      <PhoneNumberScanTypeDialog
        open={isScanTypeDialogOpen}
        onOpenChange={setIsScanTypeDialogOpen}
        selectedCount={selectedIds.size}
        onSelectFast={handleFastScan}
        onSelectSlow={handleSlowScan}
        onSelectAll={handleScanAll}
        isPending={
          scanPhoneNumbersMutation.isPending ||
          scanPhoneNumbersWithQueueMutation.isPending ||
          scanAllPhoneNumbersWithQueueMutation.isPending
        }
      />

      {/* Scan Dialog */}
      <PhoneNumberScanDialog
        open={isScanDialogOpen}
        onOpenChange={setIsScanDialogOpen}
        selectedAccountId={selectedAccountId}
        onAccountIdChange={setSelectedAccountId}
        accounts={accounts}
        selectedCount={selectedIds.size}
        dialogAction={dialogAction}
        onConfirm={() => {
          if (!selectedAccountId) return;

          if (dialogAction === "sync-friends") {
            syncFriendsMutation.mutate(selectedAccountId);
            setIsScanDialogOpen(false);
            setSelectedAccountId(null);
          } else if (dialogAction === "send-friend-request") {
            // Lọc lại những số chưa là bạn bè trước khi gửi
            const selectedPhones = phoneRows.filter(
              (p) => p.id && selectedIds.has(p.id)
            );
            // Lọc ra những số chưa là bạn bè (isFriend = false hoặc undefined) và chưa gửi lời mời, và có uid
            const validPhones = selectedPhones?.filter(
              (p) => !p.isFriend && p.hasSentFriendRequest !== 1 && p.uid
            );

            if (!validPhones || validPhones.length === 0) {
              toast({
                title: "Lỗi",
                description:
                  "Không có số điện thoại nào hợp lệ. Chỉ có thể gửi lời mời cho số chưa là bạn bè, chưa gửi lời mời và có UID.",
                variant: "destructive",
              });
              return;
            }

            sendFriendRequestsMutation.mutate({
              ids: validPhones.map((p) => p.id!),
              accountId: selectedAccountId,
            });
            setIsScanDialogOpen(false);
            setSelectedAccountId(null);
          } else if (dialogAction === "send-messages") {
            setIsScanDialogOpen(false);
            setIsSendMessageDialogOpen(true);
            // Keep selectedAccountId from the first dialog
          } else {
            // Default to scan
            handleConfirmScan();
          }
        }}
        isScanning={scanPhoneNumbersMutation.isPending}
        isSendingFriendRequest={sendFriendRequestsMutation.isPending}
        isSyncing={syncFriendsMutation.isPending}
      />

      {/* Send Message Dialog */}
      <PhoneNumberSendMessageDialog
        open={isSendMessageDialogOpen}
        onOpenChange={setIsSendMessageDialogOpen}
        messageContent={messageContent}
        onMessageContentChange={setMessageContent}
        selectedAccountId={selectedAccountId}
        accounts={accounts}
        selectedCount={selectedIds.size}
        onSubmit={handleConfirmSendMessages}
        isPending={sendBulkMessagesMutation.isPending}
      />

      {/* Delete Dialog */}
      <PhoneNumberDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        phoneNumber={selectedPhone}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />

      {/* Delete Many Dialog */}
      <PhoneNumberDeleteManyDialog
        open={isDeleteManyDialogOpen}
        onOpenChange={setIsDeleteManyDialogOpen}
        count={selectedIds.size}
        onConfirm={() => {
          deleteManyMutation.mutate(Array.from(selectedIds));
          setIsDeleteManyDialogOpen(false);
        }}
        isPending={deleteManyMutation.isPending}
      />
    </div>
  );
}
