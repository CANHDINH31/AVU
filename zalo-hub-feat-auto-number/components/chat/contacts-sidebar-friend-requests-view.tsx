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
import { UserPlus } from "lucide-react";
import React from "react";
import { FriendRequest } from "@/lib/types/friend-request";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { zaloApi } from "@/lib/api";

interface AccountType {
  id: string;
  displayName: string;
  username: string;
}

type FriendRequestsViewProps = {
  isLoadingFriendRequests: boolean;
  friendRequests: FriendRequest[];
  filterModeRequest: "all" | "byAccount";
  setFilterModeRequest: (mode: "all" | "byAccount") => void;
  selectedAccountIdRequest: string;
  setSelectedAccountIdRequest: (id: string) => void;
  uniqueAccounts: AccountType[];
  filteredFriendRequests: FriendRequest[];
  searchQuery: string;
  getAccountColor: (str: string | number) => string;
};

export const FriendRequestsView: React.FC<FriendRequestsViewProps> = ({
  isLoadingFriendRequests,
  filterModeRequest,
  setFilterModeRequest,
  selectedAccountIdRequest,
  setSelectedAccountIdRequest,
  uniqueAccounts,
  filteredFriendRequests,
  getAccountColor,
}) => {
  const acceptFriendRequestMutation = useMutation({
    mutationFn: ({
      userId,
      accountId,
    }: {
      userId: string;
      accountId: number;
    }) => zaloApi.acceptFriendRequest({ userId, accountId }),
    onSuccess: () => {
      toast.success("Chấp nhận lời mời kết bạn thành công");
    },
    onError: (error: any) => {
      toast.error("Chấp nhận lời mời kết bạn thất bại: " + error.message);
    },
  });

  const handleAcceptFriendRequest = async (
    userId: string,
    accountId: number
  ) => {
    acceptFriendRequestMutation.mutate({ userId, accountId });
  };
  const handleRejectFriendRequest = async (request: FriendRequest) => {
    // await rejectFriendRequest(request.id);
  };

  if (isLoadingFriendRequests) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-500">
            Đang tải danh sách lời mời kết bạn...
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
          value={filterModeRequest}
          onValueChange={(v) => setFilterModeRequest(v as "all" | "byAccount")}
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
      {filterModeRequest === "byAccount" && (
        <div className="mb-4">
          <Select
            value={selectedAccountIdRequest}
            onValueChange={setSelectedAccountIdRequest}
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
      {/* Danh sách lời mời kết bạn đã lọc */}
      {filteredFriendRequests.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          Không có lời mời phù hợp.
        </div>
      ) : (
        filteredFriendRequests.map((request) => {
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
                <div className="flex space-x-2 mt-1">
                  <Button
                    className="flex-1 h-7 text-xs font-medium px-2.5 py-1 rounded bg-black text-white hover:bg-gray-800"
                    onClick={() =>
                      handleAcceptFriendRequest(
                        request.userId,
                        request.accountId
                      )
                    }
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1" />
                    Chấp nhận
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-7 text-xs font-medium px-2.5 py-1 rounded hover:bg-gray-100"
                  >
                    Từ chối
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
