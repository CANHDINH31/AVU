"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Users, SettingsIcon, Phone, Video, MoreHorizontal } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: "chat", icon: MessageCircle, label: "Chat", badge: 5 },
    { id: "contacts", icon: Users, label: "Danh bạ" },
    { id: "settings", icon: SettingsIcon, label: "Cài đặt" },
  ]

  return (
    <div className="w-16 bg-blue-600 flex flex-col items-center py-4 space-y-4">
      {/* User Avatar */}
      <div className="relative">
        <Avatar className="w-10 h-10 border-2 border-white cursor-pointer">
          <AvatarImage src="/placeholder.svg?height=40&width=40" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col space-y-2 flex-1">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "secondary" : "ghost"}
            size="icon"
            className={`relative w-12 h-12 ${
              activeTab === item.id ? "bg-white text-blue-600 hover:bg-white" : "text-white hover:bg-blue-500"
            }`}
            onClick={() => onTabChange(item.id)}
          >
            <item.icon className="w-6 h-6" />
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2">
        <Button variant="ghost" size="icon" className="text-white hover:bg-blue-500 w-12 h-12">
          <Phone className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-blue-500 w-12 h-12">
          <Video className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-blue-500 w-12 h-12">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
