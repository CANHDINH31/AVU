import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  ImageIcon,
  CheckCheck,
  MessageCircle,
  EyeOff,
  Users,
  Shield,
} from "lucide-react";
import type React from "react";

export function ConversationSettingsPanel({
  conversationSettings,
  setConversationSettings,
  darkMode,
}: {
  conversationSettings: any;
  setConversationSettings: (fn: (prev: any) => any) => void;
  darkMode: boolean;
}) {
  return (
    <div
      className={`border-b p-4 ${
        darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="space-y-4">
        <h4
          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Cài đặt cuộc trò chuyện
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Thông báo
              </span>
            </div>
            <Switch
              checked={conversationSettings.notifications}
              onCheckedChange={(checked) =>
                setConversationSettings((prev) => ({
                  ...prev,
                  notifications: checked,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Tự động tải
              </span>
            </div>
            <Switch
              checked={conversationSettings.autoDownload}
              onCheckedChange={(checked) =>
                setConversationSettings((prev) => ({
                  ...prev,
                  autoDownload: checked,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCheck className="w-4 h-4" />
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Xác nhận đọc
              </span>
            </div>
            <Switch
              checked={conversationSettings.readReceipts}
              onCheckedChange={(checked) =>
                setConversationSettings((prev) => ({
                  ...prev,
                  readReceipts: checked,
                }))
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Hiện đang nhập
              </span>
            </div>
            <Switch
              checked={conversationSettings.typing}
              onCheckedChange={(checked) =>
                setConversationSettings((prev) => ({
                  ...prev,
                  typing: checked,
                }))
              }
            />
          </div>
        </div>
        <Separator />
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <EyeOff className="w-4 h-4" />
            <span>Ẩn cuộc trò chuyện</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Thông tin nhóm</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>Chặn người dùng</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
