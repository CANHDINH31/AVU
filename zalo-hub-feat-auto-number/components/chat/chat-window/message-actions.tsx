import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Reply,
  Forward,
  Copy,
  Pin,
  RotateCcw,
  Trash2,
} from "lucide-react";

interface MessageActionsProps {
  message: any;
  handleMessageAction: (action: string, messageId: string) => void;
}

export function MessageActions({
  message,
  handleMessageAction,
}: MessageActionsProps) {
  if (message.isRecalled) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
        >
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={message.sender === "me" ? "start" : "end"}>
        <DropdownMenuItem
          onClick={() => handleMessageAction("reply", message.id)}
        >
          <Reply className="w-4 h-4 mr-2" />
          Trả lời
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleMessageAction("forward", message.id)}
        >
          <Forward className="w-4 h-4 mr-2" />
          Chuyển tiếp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleMessageAction("copy", message.id)}
        >
          <Copy className="w-4 h-4 mr-2" />
          Sao chép
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleMessageAction("pin", message.id)}
        >
          <Pin className="w-4 h-4 mr-2" />
          {message.isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {message.sender === "me" && (
          <DropdownMenuItem
            onClick={() => handleMessageAction("recall", message.id)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Thu hồi
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => handleMessageAction("delete", message.id)}
          className="text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
