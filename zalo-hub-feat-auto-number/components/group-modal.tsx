"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Users, Camera } from "lucide-react"

interface GroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GroupModal({ open, onOpenChange }: GroupModalProps) {
  const [step, setStep] = useState(1) // 1: Group info, 2: Add members
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const friends = [
    {
      id: "1",
      name: "Nguyễn Văn A",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    {
      id: "2",
      name: "Trần Thị B",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
    {
      id: "3",
      name: "Lê Văn C",
      avatar: "/placeholder.svg?height=40&width=40",
      online: true,
    },
    {
      id: "4",
      name: "Phạm Thị D",
      avatar: "/placeholder.svg?height=40&width=40",
      online: false,
    },
  ]

  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  const handleCreateGroup = () => {
    // Handle group creation
    console.log("Creating group:", {
      name: groupName,
      description: groupDescription,
      members: selectedMembers,
    })
    onOpenChange(false)
    setStep(1)
    setGroupName("")
    setGroupDescription("")
    setSelectedMembers([])
  }

  const handleNext = () => {
    if (step === 1 && groupName.trim()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{step === 1 ? "Tạo nhóm mới" : "Thêm thành viên"}</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-6">
            {/* Group Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <Button size="icon" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full">
                  <Camera className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Group Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Tên nhóm *</Label>
                <Input
                  id="groupName"
                  placeholder="Nhập tên nhóm..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="groupDescription">Mô tả nhóm</Label>
                <Textarea
                  id="groupDescription"
                  placeholder="Nhập mô tả nhóm..."
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button className="flex-1" onClick={handleNext} disabled={!groupName.trim()}>
                Tiếp theo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm bạn bè..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected members count */}
            <div className="text-sm text-gray-600">Đã chọn {selectedMembers.length} thành viên</div>

            {/* Friends list */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={selectedMembers.includes(friend.id)}
                    onCheckedChange={() => handleMemberToggle(friend.id)}
                  />
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {friend.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{friend.name}</h3>
                    <p className="text-sm text-gray-500">{friend.online ? "Đang hoạt động" : "Không hoạt động"}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={handleBack}>
                Quay lại
              </Button>
              <Button className="flex-1" onClick={handleCreateGroup} disabled={selectedMembers.length === 0}>
                Tạo nhóm ({selectedMembers.length})
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
