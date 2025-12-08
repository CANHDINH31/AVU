import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Phone, Video, Settings, UserPlus, Clock, Check } from "lucide-react";
import type React from "react";
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from "@tanstack/react-query";
import { zaloApi } from "@/lib/api";
import { toast } from "sonner";
import { useFriendRequests } from "@/hooks/use-friend-requests";
import { Conversation } from "@/lib/types/conversation";

export function ChatHeader({
  conversationInfo,
  showSettings,
  setShowSettings,
  refetch,
}: {
  conversationInfo: any;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Conversation | null, Error>>;
}) {
  useFriendRequests(conversationInfo.account_id, conversationInfo.id, refetch);

  const sendFriendRequestMutation = useMutation({
    mutationFn: ({
      userId,
      accountId,
      friendId,
    }: {
      userId: string;
      accountId: number;
      friendId: number;
    }) => zaloApi.sendFriendRequest({ userId, accountId, friendId }),
    onSuccess: () => {
      toast.success("Gởi lời mời kết bạn thành công");
    },
    onError: (error: any) => {
      toast.error("Gởi lời mời kết bạn thất bại: " + error.message);
    },
  });

  const acceptFriendRequestMutation = useMutation({
    mutationFn: ({
      userId,
      accountId,
    }: {
      userId: string;
      accountId: number;
    }) => zaloApi.acceptFriendRequest({ userId, accountId }),
    onSuccess: () => {
      toast.success("Đồng ý kết bạn thành công");
      conversationInfo.isFr = 1;
    },
    onError: (error: any) => {
      toast.error("Đồng ý kết bạn thất bại: " + error.message);
    },
  });

  const handleSendFriendRequest = () => {
    sendFriendRequestMutation.mutate({
      userId: conversationInfo.friend?.userId,
      accountId: conversationInfo.account_id,
      friendId: conversationInfo.friend?.id,
    });
  };

  const handleAcceptFriendRequest = () => {
    acceptFriendRequestMutation.mutate({
      userId: conversationInfo.friend?.userId,
      accountId: conversationInfo.account_id,
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border-b flex-shrink-0  border-gray-200 bg-white">
      <div className="flex items-center space-x-3">
        <Avatar className="w-12 h-12">
          <AvatarImage
            src={conversationInfo.friend?.avatar || "/placeholder.svg"}
          />
          <AvatarFallback>
            {(
              conversationInfo.friend?.displayName ||
              conversationInfo.friend?.username ||
              conversationInfo.friend?.zaloName ||
              "?"
            ).charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg text-gray-900">
            {conversationInfo.friend?.displayName ||
              conversationInfo.friend?.username ||
              conversationInfo.friend?.zaloName ||
              "Tên bạn bè"}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <p className="text-sm text-green-500">Đang hoạt động</p>
            </div>
            <span className="text-sm  text-gray-300">•</span>
            <Badge variant="outline" className="text-xs">
              {conversationInfo.account?.displayName || "Tài khoản"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          {conversationInfo.isFr === 0 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10"
                  onClick={handleSendFriendRequest}
                >
                  <UserPlus className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gửi lời mời kết bạn</p>
              </TooltipContent>
            </Tooltip>
          ) : conversationInfo.isFr === 2 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10">
                  <Clock className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đang chờ phản hồi</p>
              </TooltipContent>
            </Tooltip>
          ) : conversationInfo.isFr === 3 ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10"
                  onClick={handleAcceptFriendRequest}
                >
                  <Check className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đồng ý kết bạn</p>
              </TooltipContent>
            </Tooltip>
          ) : null}

          {/* <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <Phone className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gọi điện thoại</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-10 h-10">
                <Video className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Gọi video</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cài đặt</p>
            </TooltipContent>
          </Tooltip> */}
        </TooltipProvider>
      </div>
    </div>
  );
}
