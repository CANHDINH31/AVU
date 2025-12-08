"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserPlus, QrCode, Phone } from "lucide-react"

interface AddFriendModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFriendModal({ open, onOpenChange }: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")

  const searchResults = [
    {
      id: "1",
      name: "Hoàng Văn E",
      phone: "0789123456",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 2,
      isFriend: false,
      requestSent: false,
    },
    {
      id: "2",
      name: "Ngô Thị F",
      phone: "0654321987",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 7,
      isFriend: false,
      requestSent: true,
    },
    {
      id: "3",
      name: "Trần Văn G",
      phone: "0321654987",
      avatar: "/placeholder.svg?height=40&width=40",
      mutualFriends: 0,
      isFriend: true,
      requestSent: false,
    },
  ]

  const filteredResults = searchResults.filter(
    (user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.phone.includes(searchQuery),
  )

  const handleSendRequest = (userId: string) => {
    // Handle send friend request
    console.log("Sending friend request to:", userId)
  }

  const handleAddByPhone = () => {
    // Handle add friend by phone
    console.log("Adding friend by phone:", phoneNumber)
  }

  const handleAddByEmail = () => {
    // Handle add friend by email
    console.log("Adding friend by email:", email)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm bạn bè</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="text-xs">
              <Search className="w-3 h-3 mr-1" />
              Tìm kiếm
            </TabsTrigger>
            <TabsTrigger value="phone" className="text-xs">
              <Phone className="w-3 h-3 mr-1" />
              SĐT
            </TabsTrigger>
            <TabsTrigger value="qr" className="text-xs">
              <QrCode className="w-3 h-3 mr-1" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchQuery &&
                filteredResults.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                      {user.mutualFriends > 0 && (
                        <p className="text-xs text-gray-400">{user.mutualFriends} bạn chung</p>
                      )}
                    </div>
                    <div>
                      {user.isFriend ? (
                        <Button variant="outline" size="sm" disabled>
                          Đã là bạn
                        </Button>
                      ) : user.requestSent ? (
                        <Button variant="outline" size="sm" disabled>
                          Đã gửi lời mời
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleSendRequest(user.id)}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Kết bạn
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              {searchQuery && filteredResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">Không tìm thấy kết quả nào</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                placeholder="Nhập số điện thoại..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAddByPhone} disabled={!phoneNumber.trim()}>
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm bạn
            </Button>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4">
            <div className="text-center py-8">
              <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Mã QR của bạn</h3>
              <p className="text-sm text-gray-500 mb-4">Chia sẻ mã QR này để bạn bè có thể thêm bạn</p>
              <Button variant="outline">Chia sẻ mã QR</Button>
            </div>

            <div className="border-t pt-4">
              <Button className="w-full" variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                Quét mã QR
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
