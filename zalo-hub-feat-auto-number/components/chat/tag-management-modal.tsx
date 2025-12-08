"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Edit, Trash2, Tag } from "lucide-react"

interface TagType {
  id: string
  name: string
  color: string
  count: number
}

interface TagManagementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tags: TagType[]
  onCreateTag: (name: string, color: string) => void
  onUpdateTag: (id: string, name: string, color: string) => void
  onDeleteTag: (id: string) => void
  darkMode: boolean
}

const colorOptions = [
  { name: "Xanh dương", value: "bg-blue-500" },
  { name: "Xanh lá", value: "bg-green-500" },
  { name: "Tím", value: "bg-purple-500" },
  { name: "Cam", value: "bg-orange-500" },
  { name: "Đỏ", value: "bg-red-500" },
  { name: "Hồng", value: "bg-pink-500" },
  { name: "Vàng", value: "bg-yellow-500" },
  { name: "Xám", value: "bg-gray-500" },
]

export function TagManagementModal({
  open,
  onOpenChange,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  darkMode,
}: TagManagementModalProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<TagType | null>(null)
  const [tagName, setTagName] = useState("")
  const [selectedColor, setSelectedColor] = useState("bg-blue-500")

  const handleSubmit = () => {
    if (!tagName.trim()) return

    if (editingTag) {
      onUpdateTag(editingTag.id, tagName, selectedColor)
      setEditingTag(null)
    } else {
      onCreateTag(tagName, selectedColor)
    }

    setTagName("")
    setSelectedColor("bg-blue-500")
    setIsCreating(false)
  }

  const handleEdit = (tag: TagType) => {
    setEditingTag(tag)
    setTagName(tag.name)
    setSelectedColor(tag.color)
    setIsCreating(true)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingTag(null)
    setTagName("")
    setSelectedColor("bg-blue-500")
  }

  const handleDelete = (tagId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thẻ này?")) {
      onDeleteTag(tagId)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-md ${darkMode ? "bg-gray-800 border-gray-700" : ""}`}>
        <DialogHeader>
          <DialogTitle className={`flex items-center ${darkMode ? "text-white" : ""}`}>
            <Tag className="w-5 h-5 mr-2" />
            Quản lý thẻ phân loại
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create/Edit Form */}
          {isCreating && (
            <div
              className={`p-4 border rounded-lg space-y-3 ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"}`}
            >
              <div>
                <Label htmlFor="tagName" className={darkMode ? "text-gray-300" : ""}>
                  Tên thẻ
                </Label>
                <Input
                  id="tagName"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Nhập tên thẻ..."
                  className={darkMode ? "bg-gray-600 border-gray-500 text-white" : ""}
                />
              </div>

              <div>
                <Label className={darkMode ? "text-gray-300" : ""}>Màu sắc</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`w-8 h-8 rounded-full ${color.value} border-2 ${
                        selectedColor === color.value ? "border-white shadow-lg" : "border-gray-300"
                      }`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleSubmit} disabled={!tagName.trim()} className="flex-1">
                  {editingTag ? "Cập nhật" : "Tạo thẻ"}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Hủy
                </Button>
              </div>
            </div>
          )}

          {/* Add New Button */}
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Tạo thẻ mới
            </Button>
          )}

          {/* Tags List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${tag.color}`}></div>
                  <div>
                    <h4 className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{tag.name}</h4>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {tag.count} cuộc trò chuyện
                    </p>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(tag)} className="w-8 h-8">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tag.id)}
                    className="w-8 h-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {tags.length === 0 && (
            <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chưa có thẻ phân loại nào</p>
              <p className="text-sm">Tạo thẻ đầu tiên để phân loại cuộc trò chuyện</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
