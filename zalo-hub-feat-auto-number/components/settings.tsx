"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Volume2,
  Download,
  Trash2,
  Key,
  Smartphone,
  Eye,
  MessageSquare,
} from "lucide-react"

interface SettingsProps {
  onShowProfile: () => void
}

export function Settings({ onShowProfile }: SettingsProps) {
  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [onlineStatus, setOnlineStatus] = useState(true)
  const [autoDownload, setAutoDownload] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)
  const [volume, setVolume] = useState([75])
  const [language, setLanguage] = useState("vi")
  const [fontSize, setFontSize] = useState("medium")

  const settingsGroups = [
    {
      title: "Tài khoản",
      items: [
        {
          icon: User,
          label: "Thông tin cá nhân",
          description: "Chỉnh sửa hồ sơ của bạn",
          onClick: onShowProfile,
        },
        {
          icon: Shield,
          label: "Bảo mật",
          description: "Mật khẩu và xác thực 2 bước",
        },
        {
          icon: Key,
          label: "Quyền riêng tư",
          description: "Kiểm soát ai có thể liên hệ với bạn",
        },
        {
          icon: Smartphone,
          label: "Thiết bị",
          description: "Quản lý thiết bị đã đăng nhập",
        },
      ],
    },
    {
      title: "Chat & Tin nhắn",
      items: [
        {
          icon: MessageSquare,
          label: "Sao lưu chat",
          description: "Sao lưu và khôi phục tin nhắn",
        },
        {
          icon: Download,
          label: "Tự động tải xuống",
          description: "Tự động tải ảnh và video",
        },
        {
          icon: Eye,
          label: "Đã xem tin nhắn",
          description: "Hiển thị trạng thái đã đọc",
        },
      ],
    },
    {
      title: "Thông báo",
      items: [
        {
          icon: Bell,
          label: "Thông báo",
          description: "Quản lý thông báo ứng dụng",
        },
        {
          icon: Volume2,
          label: "Âm thanh",
          description: "Âm thanh thông báo và cuộc gọi",
        },
      ],
    },
    {
      title: "Giao diện",
      items: [
        {
          icon: Palette,
          label: "Chủ đề",
          description: "Màu sắc và hình nền",
        },
        {
          icon: Globe,
          label: "Ngôn ngữ",
          description: "Thay đổi ngôn ngữ ứng dụng",
        },
        {
          icon: Moon,
          label: "Chế độ tối",
          description: "Giao diện tối cho mắt",
        },
      ],
    },
    {
      title: "Hỗ trợ",
      items: [
        {
          icon: HelpCircle,
          label: "Trợ giúp",
          description: "Câu hỏi thường gặp và hỗ trợ",
        },
      ],
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 cursor-pointer" onClick={onShowProfile}>
                <AvatarImage src="/placeholder.svg?height=64&width=64" />
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Nguyễn Văn Nam</h2>
                <p className="text-gray-500">+84 123 456 789</p>
                <p className="text-sm text-gray-400 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Đang hoạt động
                </p>
              </div>
              <Button variant="outline" onClick={onShowProfile}>
                Chỉnh sửa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cài đặt nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Thông báo</h3>
                  <p className="text-sm text-gray-500">Nhận thông báo tin nhắn mới</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Âm thanh thông báo</h3>
                  <p className="text-sm text-gray-500">Phát âm thanh khi có tin nhắn mới</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>

            {soundEnabled && (
              <div className="ml-13 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Âm lượng</span>
                  <span className="text-sm text-gray-500">{volume[0]}%</span>
                </div>
                <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="w-full" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Tự động tải ảnh</h3>
                  <p className="text-sm text-gray-500">Tự động tải ảnh trong cuộc trò chuyện</p>
                </div>
              </div>
              <Switch checked={autoDownload} onCheckedChange={setAutoDownload} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Moon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Chế độ tối</h3>
                  <p className="text-sm text-gray-500">Sử dụng giao diện tối</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Hiển thị trạng thái online</h3>
                  <p className="text-sm text-gray-500">Cho phép bạn bè thấy khi bạn online</p>
                </div>
              </div>
              <Switch checked={onlineStatus} onCheckedChange={setOnlineStatus} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Xác nhận đã đọc</h3>
                  <p className="text-sm text-gray-500">Gửi xác nhận khi đọc tin nhắn</p>
                </div>
              </div>
              <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Ngôn ngữ</h3>
                    <p className="text-sm text-gray-500">Chọn ngôn ngữ hiển thị</p>
                  </div>
                </div>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Palette className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Cỡ chữ</h3>
                    <p className="text-sm text-gray-500">Kích thước chữ trong chat</p>
                  </div>
                </div>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="w-32">
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

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={item.onClick}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.label}</h3>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Storage & Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lưu trữ & Dữ liệu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Dung lượng đã sử dụng</h3>
                <p className="text-sm text-gray-500">2.3 GB / 5 GB</p>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ảnh:</span>
                <span className="text-gray-900">1.2 GB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Video:</span>
                <span className="text-gray-900">800 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tệp tin:</span>
                <span className="text-gray-900">200 MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Âm thanh:</span>
                <span className="text-gray-900">100 MB</span>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Dọn dẹp bộ nhớ
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card>
          <CardContent className="p-4">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
