"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  MessageSquare,
  Eye,
  Smartphone,
  Edit,
} from "lucide-react";

interface SettingsSidebarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function SettingsSidebar({
  darkMode,
  onToggleDarkMode,
}: SettingsSidebarProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoDownload, setAutoDownload] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [volume, setVolume] = useState([75]);
  const [language, setLanguage] = useState("vi");
  const [fontSize, setFontSize] = useState("medium");

  return (
    <div
      className={`flex flex-col h-full ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${
          darkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <h2
          className={`text-xl font-semibold ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Cài đặt
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <Card
          className={`${
            darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback className="text-xl">Me</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3
                  className={`font-semibold text-lg ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Nguyễn Văn Nam
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  +84 123 456 789
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Đang hoạt động
                  </span>
                </div>
              </div>
              <Button variant="outline" size="icon" className="w-10 h-10">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card
          className={`${
            darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-base flex items-center ${
                darkMode ? "text-white" : ""
              }`}
            >
              <Palette className="w-5 h-5 mr-2" />
              Giao diện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-gray-600" : "bg-gray-100"
                  }`}
                >
                  {darkMode ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-medium ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Chế độ tối
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Giao diện tối bảo vệ mắt
                  </p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={onToggleDarkMode} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Cỡ chữ
                </span>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Nhỏ</SelectItem>
                    <SelectItem value="medium">Vừa</SelectItem>
                    <SelectItem value="large">Lớn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card
          className={`${
            darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-base flex items-center ${
                darkMode ? "text-white" : ""
              }`}
            >
              <Bell className="w-5 h-5 mr-2" />
              Thông báo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Thông báo tin nhắn
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Hiển thị thông báo khi có tin nhắn mới
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Âm thanh thông báo
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Phát âm thanh khi có tin nhắn
                </p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {soundEnabled && (
              <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Âm lượng
                  </span>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {volume[0]}%
                  </span>
                </div>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Settings */}
        <Card
          className={`${
            darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-base flex items-center ${
                darkMode ? "text-white" : ""
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat & Tin nhắn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Tự động tải ảnh
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Tự động tải ảnh trong cuộc trò chuyện
                </p>
              </div>
              <Switch
                checked={autoDownload}
                onCheckedChange={setAutoDownload}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Xác nhận đã đọc
                </h4>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Gửi xác nhận khi đọc tin nhắn
                </p>
              </div>
              <Switch
                checked={readReceipts}
                onCheckedChange={setReadReceipts}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card
          className={`${
            darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-base flex items-center ${
                darkMode ? "text-white" : ""
              }`}
            >
              <Globe className="w-5 h-5 mr-2" />
              Ngôn ngữ & Khu vực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Ngôn ngữ hiển thị
              </span>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="zh">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card
          className={`${
            darkMode ? "bg-gray-700 border-gray-600" : "border-gray-200"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle
              className={`text-base flex items-center ${
                darkMode ? "text-white" : ""
              }`}
            >
              <Shield className="w-5 h-5 mr-2" />
              Quyền riêng tư
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-12">
              <Eye className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">
                  Ai có thể nhìn thấy tôi online
                </div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Tất cả mọi người
                </div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12">
              <MessageSquare className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Ai có thể nhắn tin cho tôi</div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Bạn bè
                </div>
              </div>
            </Button>
            <Button variant="outline" className="w-full justify-start h-12">
              <Smartphone className="w-4 h-4 mr-3" />
              <div className="text-left">
                <div className="font-medium">Quản lý thiết bị đăng nhập</div>
                <div
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  3 thiết bị
                </div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
