import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useFriendByUidFrom } from "@/hooks/use-friends";
import { iconToEmoji } from "../../../lib/utils/convertReactions";

interface UserReactionItemProps {
  uidFrom: string;
  count: number;
  rIcon: string;
}

export const UserReactionItem = ({
  uidFrom,
  count,
  rIcon,
}: UserReactionItemProps) => {
  // Sử dụng uidFrom để tìm friend (có thể là msgSender hoặc uidFrom)
  const { data: friends, isLoading } = useFriendByUidFrom(uidFrom);

  if (isLoading) {
    return (
      <div className="flex items-center py-2 px-2 rounded-lg hover:bg-[#f5f6fa] transition mb-1">
        <div className="w-9 h-9 mr-3 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
        </div>
      </div>
    );
  }

  // Lấy friend đầu tiên từ mảng (nếu có)
  const friend = friends && friends.length > 0 ? friends[0] : null;
  const user = friend || { avatar: "", displayName: "", zaloName: "" };

  return (
    <div className="flex items-center py-2 px-2 rounded-lg hover:bg-[#f5f6fa] transition mb-1">
      <Avatar className="w-9 h-9 mr-3">
        <AvatarImage src={user.avatar || "/placeholder-user.jpg"} />
        <AvatarFallback>{user.displayName?.charAt(0) || "?"}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-gray-900 flex-1 truncate">
        {user.displayName || user.zaloName || uidFrom}
      </span>
      <span className="flex items-center gap-1 min-w-[40px] justify-end">
        <span className="text-lg">{iconToEmoji[rIcon] || rIcon}</span>
        <span className="text-xs font-bold text-blue-500">{count}</span>
      </span>
    </div>
  );
};
