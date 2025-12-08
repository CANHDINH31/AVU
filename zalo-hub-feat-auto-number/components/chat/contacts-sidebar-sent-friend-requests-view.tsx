import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserMinus, Clock } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { SentFriendRequest } from "@/lib/types/sent-friend-request";
import { useMutation } from "@tanstack/react-query";
import { zaloApi } from "@/lib/api";

interface AccountType {
  id: string;
  displayName: string;
  username: string;
}

type SentFriendRequestsViewProps = {
  isLoadingSentFriendRequests: boolean;
  sentFriendRequests: SentFriendRequest[];
  filterModeSentRequest: "all" | "byAccount";
  setFilterModeSentRequest: (mode: "all" | "byAccount") => void;
  selectedAccountIdSentRequest: string;
  setSelectedAccountIdSentRequest: (id: string) => void;
  uniqueAccounts: AccountType[];
  filteredSentFriendRequests: SentFriendRequest[];
  searchQuery: string;
  getAccountColor: (str: string | number) => string;
};

export const SentFriendRequestsView: React.FC<SentFriendRequestsViewProps> = ({
  isLoadingSentFriendRequests,
  filterModeSentRequest,
  setFilterModeSentRequest,
  selectedAccountIdSentRequest,
  setSelectedAccountIdSentRequest,
  uniqueAccounts,
  filteredSentFriendRequests,
  getAccountColor,
}) => {
  const undoSentFriendRequestMutation = useMutation({
    mutationFn: ({
      userId,
      accountId,
    }: {
      userId: string;
      accountId: number;
    }) => zaloApi.undoSentFriendRequest({ userId, accountId }),
    onSuccess: () => {
      toast.success("Thu hồi lời mời kết bạn thành công");
    },
    onError: (error: any) => {
      toast.error("Thu hồi lời mời kết bạn thất bại: " + error.message);
    },
  });

  const handleUndoSentFriendRequest = async (
    userId: string,
    accountId: number
  ) => {
    undoSentFriendRequestMutation.mutate({ userId, accountId });
  };

  if (isLoadingSentFriendRequests) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-500">
            Đang tải danh sách lời mời đã gửi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter Tabs */}
      <div className="mb-4">
        <Tabs
          value={filterModeSentRequest}
          onValueChange={(v) =>
            setFilterModeSentRequest(v as "all" | "byAccount")
          }
          className="w-full"
        >
          <TabsList className="grid w-full bg-gray-100 grid-cols-2">
            <TabsTrigger
              value="all"
              className="text-xs px-2 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Tất cả
            </TabsTrigger>
            <TabsTrigger
              value="byAccount"
              className="text-xs px-1 py-2 leading-tight data-[state=active]:bg-white data-[state=active]:text-gray-900"
            >
              Theo tài khoản
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Account Selector (chỉ hiển thị khi chọn "Theo tài khoản") */}
      {filterModeSentRequest === "byAccount" && (
        <div className="mb-4">
          <Select
            value={selectedAccountIdSentRequest}
            onValueChange={setSelectedAccountIdSentRequest}
          >
            <SelectTrigger className="bg-gray-100 border-gray-200">
              <SelectValue placeholder="Chọn tài khoản..." />
            </SelectTrigger>
            <SelectContent>
              {uniqueAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {/* Danh sách lời mời đã gửi đã lọc */}
      {filteredSentFriendRequests.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Không có lời mời đã gửi nào.
        </div>
      ) : (
        filteredSentFriendRequests.map((request) => {
          return (
            <div
              key={request.id}
              className="flex items-center p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
            >
              <div className="relative">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={request.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {request?.zaloName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-gray-900">
                  {request.zaloName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Đang chờ phản hồi
                  </span>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-7 text-xs font-medium px-2.5 py-1 rounded hover:bg-gray-100"
                    onClick={() =>
                      handleUndoSentFriendRequest(
                        request.userId,
                        request.accountId
                      )
                    }
                  >
                    <UserMinus className="w-3.5 h-3.5 mr-1" />
                    Hủy lời mời
                  </Button>
                </div>
                {request.account?.displayName && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 h-5 font-medium mt-1"
                    style={{
                      backgroundColor: getAccountColor(
                        request.account.displayName
                      ),
                      color: "#374151",
                      border: "1px solid #d1d5db",
                    }}
                  >
                    {request.account.displayName}
                  </Badge>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
