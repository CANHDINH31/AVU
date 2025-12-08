"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Archive, Filter, Users, MessageSquarePlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatListProps {
  onSelectChat: (chatId: string) => void
  selectedChat: string | null
  onCreateGroup: () => void
}

export function ChatList({ onSelectChat, selectedChat, onCreateGroup }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") // all, unread, groups

  const chats = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      lastMessage: "Chào bạn, hôm nay thế nào?",
      time: "14:30",
      unread: 3,
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      isGroup: false,
      typing: false,
      lastSeen: "Đang hoạt động",
      pinned: true,
    },
    {
      id: "2",
      name: "Nhóm Công Việc",
      lastMessage: "Cuộc họp lúc 3h chiều nhé",
      time: "13:45",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
      isGroup: true,
      typing: true,
      typingUser: "Trần Văn B",
      members: 15,
      pinned: false,
    },
    {
      id: "3",
      name: "Trần Thị B",
      lastMessage: "Cảm ơn bạn nhiều!",
      time: "12:20",
      unread: 1,
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      isGroup: false,
      typing: false,
      lastSeen: "Đang hoạt động",
      pinned: false,
    },
    {
      id: "4",
      name: "Gia Đình",
      lastMessage: "Tối nay về ăn cơm nhé",
      time: "11:15",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
      isGroup: true,
      typing: false,
      members: 8,
      pinned: true,
    },
    {
      id: "5",
      name: "Lê Văn C",
      lastMessage: "OK, tôi sẽ gửi file cho bạn",
      time: "10:30",
      unread: 0,
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
      isGroup: false,
      typing: false,
      lastSeen: "Hoạt động 2 giờ trước",
      pinned: false,
    },
  ]

  const filteredChats = chats
    .filter((chat) => {
      if (filter === "unread" && chat.unread === 0) return false
      if (filter === "groups" && !chat.isGroup) return false
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      // Pinned chats first
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return 0
    })

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Chat</h2>
          <div className="flex space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Cuộc trò chuyện mới
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCreateGroup}>
                  <Users className="w-4 h-4 mr-2" />
                  Tạo nhóm
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Archive className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("all")}>Tất cả</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("unread")}>Chưa đọc</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("groups")}>Nhóm</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter Badges */}
        {filter !== "all" && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {filter === "unread" ? "Chưa đọc" : "Nhóm"}
              <button onClick={() => setFilter("all")} className="ml-2 text-gray-500 hover:text-gray-700">
                ×
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 relative ${
              selectedChat === chat.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            {/* Pin indicator */}
            {chat.pinned && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>}

            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={chat.avatar || "/placeholder.svg"} />
                <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {chat.online && !chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              )}
              {chat.isGroup && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Users className="w-2 h-2 text-white" />
                </div>
              )}
            </div>

            <div className="ml-3 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate flex items-center">
                  {chat.name}
                  {chat.isGroup && <span className="ml-1 text-xs text-gray-500">({chat.members})</span>}
                </h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                {chat.typing ? (
                  <p className="text-sm text-blue-500 italic">
                    {chat.isGroup ? `${chat.typingUser} đang nhập...` : "Đang nhập..."}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                )}
                {chat.unread > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">{chat.unread}</Badge>
                )}
              </div>
              {!chat.isGroup && !chat.online && <p className="text-xs text-gray-400 mt-1">{chat.lastSeen}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
