import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pin, ChevronUp, ChevronDown, X } from "lucide-react";
import type React from "react";

export function PinnedMessages({
  pinnedMessages,
  showPinnedMessages,
  setShowPinnedMessages,
  handleMessageAction,
}: {
  pinnedMessages: any[];
  showPinnedMessages: boolean;
  setShowPinnedMessages: (v: boolean) => void;
  handleMessageAction: (action: string, messageId: string) => void;
}) {
  if (!pinnedMessages.length) return null;
  return (
    <Collapsible open={showPinnedMessages} onOpenChange={setShowPinnedMessages}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 bg-yellow-50">
          <div className="flex items-center space-x-2">
            <Pin className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">
              {pinnedMessages.length} tin nhắn đã ghim
            </span>
          </div>
          {showPinnedMessages ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="max-h-32 overflow-y-auto border-b border-gray-200 bg-yellow-50">
          {pinnedMessages.map((message) => (
            <div
              key={message.id}
              className="p-3 border-b last:border-b-0 border-yellow-200 hover:bg-yellow-100"
            >
              <div className="flex items-start space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage
                    src={message.senderAvatar || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-xs">
                    {message.senderName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-yellow-700">
                      {message.senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.time}
                    </span>
                  </div>
                  <p className="text-sm truncate text-gray-600">
                    {message.content}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0"
                  onClick={() => handleMessageAction("pin", message.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
