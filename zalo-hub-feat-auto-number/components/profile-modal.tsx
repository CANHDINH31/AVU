"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Edit, Save, X } from "lucide-react"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "Nguyễn Văn Nam",
    phone: "+84 123 456 789",
    email: "nam.nguyen@email.com",
    bio: "Yêu thích công nghệ và du lịch",
    birthday: "1990-01-01",
    gender: "Nam",
    address: "Hà Nội, Việt Nam",
  })

  const handleSave = () => {
    // Handle save profile
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset changes
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Thông tin cá nhân
            {!isEditing ? (
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4" />
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96" />
                <AvatarFallback className="text-2xl">NVN</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="icon" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full">
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <p className="text-gray-500">{profile.phone}</p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tên hiển thị</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="bio">Giới thiệu</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!isEditing}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="birthday">Ngày sinh</Label>
              <Input
                id="birthday"
                type="date"
                value={profile.birthday}
                onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                Hủy
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Lưu thay đổi
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
