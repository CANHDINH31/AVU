"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share, MoreHorizontal, Camera, MapPin, Smile } from "lucide-react"

export function Timeline() {
  const [newPost, setNewPost] = useState("")

  const posts = [
    {
      id: "1",
      author: "Nguyễn Văn A",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "2 giờ trước",
      content: "Hôm nay thời tiết đẹp quá! Đi dạo công viên với gia đình 🌞",
      image: "/placeholder.svg?height=300&width=400",
      likes: 15,
      comments: 3,
      shares: 2,
      liked: false,
    },
    {
      id: "2",
      author: "Trần Thị B",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "4 giờ trước",
      content: "Món ăn ngon tại nhà hàng mới! Ai muốn thử không? 🍜",
      image: "/placeholder.svg?height=300&width=400",
      likes: 28,
      comments: 8,
      shares: 5,
      liked: true,
    },
    {
      id: "3",
      author: "Lê Văn C",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "1 ngày trước",
      content: "Chúc mừng năm mới! Chúc mọi người một năm mới an khang thịnh vượng! 🎉",
      likes: 42,
      comments: 12,
      shares: 8,
      liked: true,
    },
  ]

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      // Handle post submission
      setNewPost("")
    }
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Create Post */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Bạn đang nghĩ gì?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="border-none resize-none focus:ring-0 p-0 text-base"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Camera className="w-4 h-4 mr-2" />
                      Ảnh
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <MapPin className="w-4 h-4 mr-2" />
                      Vị trí
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500">
                      <Smile className="w-4 h-4 mr-2" />
                      Cảm xúc
                    </Button>
                  </div>
                  <Button
                    onClick={handlePostSubmit}
                    disabled={!newPost.trim()}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Đăng
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        {posts.map((post) => (
          <Card key={post.id}>
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={post.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-500">{post.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-gray-800">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="relative">
                  <img src={post.image || "/placeholder.svg"} alt="Post content" className="w-full h-64 object-cover" />
                </div>
              )}

              {/* Post Stats */}
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.likes} lượt thích</span>
                  <div className="flex space-x-4">
                    <span>{post.comments} bình luận</span>
                    <span>{post.shares} chia sẻ</span>
                  </div>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-around p-2">
                <Button variant="ghost" size="sm" className={`flex-1 ${post.liked ? "text-red-500" : "text-gray-500"}`}>
                  <Heart className={`w-4 h-4 mr-2 ${post.liked ? "fill-current" : ""}`} />
                  Thích
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-gray-500">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Bình luận
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-gray-500">
                  <Share className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
