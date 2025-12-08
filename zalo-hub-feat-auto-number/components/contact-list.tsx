"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  UserPlus,
  Users,
  Star,
  MoreVertical,
  MessageCircle,
  Phone,
  Video,
  UserMinus,
  UserCheck,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ContactListProps {
  onShowProfile: () => void
  onAddFriend: () => void
  onCreateGroup: () => void
}

export function ContactList({ onShowProfile, onAddFriend, onCreateGroup }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const friends = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      phone: "0123456789",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      isFavorite: true,
      isBlocked: false,
      lastSeen: "Đang hoạt động",
      mutualFriends: 5,
    },
    {
      id: "2",
      name: "Trần Thị B",
      phone: "0987654321",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
      isFavorite: false,
      isBlocked: false,
      lastSeen: "Hoạt động 2 giờ trước",
      mutualFriends: 3,
    },
    {
      id: "3",
      name: "Lê Văn C",
      phone: "0369852147",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
      isFavorite: true,
      isBlocked: false,
      lastSeen: "Đang hoạt động",
      mutualFriends: 8,
    },
    {
      id: "4",
      name: "Phạm Thị D",
      phone: "0456789123",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
      isFavorite: false,
      isBlocked: true,
      lastSeen: "Hoạt động 1 ngày trước",
      mutualFriends: 1,
    },
  ]

  const groups = [
    {
      id: "1",
      name: "Nhóm Công Việc",
      members: 15,
      avatar: "/placeholder.svg?height=40&width=40",
      description: "Nhóm thảo luận công việc",
      isAdmin: true,
      lastActivity: "2 giờ trước",
    },
    {
      id: "2",
      name: "Gia Đình",
      members: 8,
      avatar: "/placeholder.svg?height=40&width=40",
      description: "Nhóm gia đình",
      isAdmin: false,
      lastActivity: "1 ngày trước",
    },
    {
      id: "3",
      name: "Bạn Học",
      members: 25,
      avatar: "/placeholder.svg?height=40&width=40",
      description: "Nhóm bạn cùng trường",
      isAdmin: true,
      lastActivity: "3 giờ trước",
    },
  ]

  const friendRequests = [
    {
      id: "1",
      name: "Hoàng Văn E",
      phone: "0789123456",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 2,
      requestTime: "2 giờ trước",
    },
    {
      id: "2",
      name: "Ngô Thị F",
      phone: "0654321987",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 7,
      requestTime: "1 ngày trước",
    },
  ]

  const filteredFriends = friends.filter(
    (friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()) && !friend.isBlocked,
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const blockedFriends = friends.filter((friend) => friend.isBlocked)

  const handleFriendAction = (action: string, friendId: string) => {
    switch (action) {
      case "message":
        // Handle message
        break
      case "call":
        // Handle call
        break
      case "video":
        // Handle video call
        break
      case "favorite":
        // Handle favorite toggle
        break
      case "block":
        // Handle block
        break
      case "unblock":
        // Handle unblock
        break
      case "remove":
        // Handle remove friend
        break
    }
  }

  const handleRequestAction = (action: "accept" | "decline", requestId: string) => {
    // Handle friend request
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Danh bạ</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={onAddFriend}>
              <UserPlus className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onCreateGroup}>
              <Users className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="friends" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mx-4 mt-4">
          <TabsTrigger value="friends" className="flex items-center text-xs">
            <Users className="w-3 h-3 mr-1" />
            Bạn bè ({friends.filter((f) => !f.isBlocked).length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center text-xs">
            <Users className="w-3 h-3 mr-1" />
            Nhóm ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center text-xs">
            <UserPlus className="w-3 h-3 mr-1" />
            Lời mời ({friendRequests.length})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex items-center text-xs">
            <UserMinus className="w-3 h-3 mr-1" />
            Đã chặn ({blockedFriends.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="flex-1 overflow-y-auto mt-4">
          <div className="px-4">
            {/* Favorites */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Yêu thích
              </h3>
              <div className="space-y-2">
                {friends
                  .filter((f) => f.isFavorite && !f.isBlocked)
                  .map((friend) => (
                    <div key={friend.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                      <div className="relative">
                        <Avatar className="w-12 h-12 cursor-pointer" onClick={onShowProfile}>
                          <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {friend.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="font-medium text-gray-900">{friend.name}</h3>
                        <p className="text-sm text-gray-500">{friend.lastSeen}</p>
                        <p className="text-xs text-gray-400">{friend.mutualFriends} bạn chung</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleFriendAction("message", friend.id)}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleFriendAction("call", friend.id)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleFriendAction("video", friend.id)}>
                              <Video className="w-4 h-4 mr-2" />
                              Gọi video
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFriendAction("favorite", friend.id)}>
                              <Star className="w-4 h-4 mr-2" />
                              Bỏ yêu thích
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleFriendAction("block", friend.id)}>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Chặn
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleFriendAction("remove", friend.id)}
                              className="text-red-600"
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Xóa bạn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* All Friends */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Tất cả bạn bè</h3>
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div key={friend.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div className="relative">
                      <Avatar className="w-12 h-12 cursor-pointer" onClick={onShowProfile}>
                        <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {friend.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {friend.name}
                        {friend.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-current ml-1" />}
                      </h3>
                      <p className="text-sm text-gray-500">{friend.lastSeen}</p>
                      <p className="text-xs text-gray-400">{friend.mutualFriends} bạn chung</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {friend.online && (
                        <Badge variant="secondary" className="text-xs">
                          Online
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleFriendAction("message", friend.id)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Nhắn tin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFriendAction("call", friend.id)}>
                            <Phone className="w-4 h-4 mr-2" />
                            Gọi điện
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFriendAction("video", friend.id)}>
                            <Video className="w-4 h-4 mr-2" />
                            Gọi video
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFriendAction("favorite", friend.id)}>
                            <Star className="w-4 h-4 mr-2" />
                            {friend.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFriendAction("block", friend.id)}>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Chặn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="groups" className="flex-1 overflow-y-auto mt-4">
          <div className="px-4 space-y-2">
            {filteredGroups.map((group) => (
              <div key={group.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={group.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-900 flex items-center">
                    {group.name}
                    {group.isAdmin && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Admin
                      </Badge>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">{group.description}</p>
                  <p className="text-xs text-gray-400">
                    {group.members} thành viên • Hoạt động {group.lastActivity}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mở cuộc trò chuyện
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="w-4 h-4 mr-2" />
                      Xem thành viên
                    </DropdownMenuItem>
                    {group.isAdmin && (
                      <DropdownMenuItem>
                        <MoreVertical className="w-4 h-4 mr-2" />
                        Quản lý nhóm
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <UserMinus className="w-4 h-4 mr-2" />
                      Rời nhóm
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="flex-1 overflow-y-auto mt-4">
          <div className="px-4 space-y-2">
            {friendRequests.map((request) => (
              <div key={request.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-900">{request.name}</h3>
                  <p className="text-sm text-gray-500">{request.mutualFriends} bạn chung</p>
                  <p className="text-xs text-gray-400">Gửi lời mời {request.requestTime}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleRequestAction("accept", request.id)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Chấp nhận
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRequestAction("decline", request.id)}>
                    Từ chối
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="flex-1 overflow-y-auto mt-4">
          <div className="px-4 space-y-2">
            {blockedFriends.map((friend) => (
              <div key={friend.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12 opacity-50">
                  <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-900">{friend.name}</h3>
                  <p className="text-sm text-gray-500">Đã bị chặn</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleFriendAction("unblock", friend.id)}>
                  Bỏ chặn
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
