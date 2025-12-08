"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Calendar,
  Clock,
  MessageCircle,
  Settings,
  Shield,
  Trash2,
  Edit,
  Save,
  X,
  QrCode,
  Cookie,
  Activity,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Account } from "@/lib/types/account";

interface AccountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onUpdate: (account: Account) => void;
  onDelete: () => void;
}

export function AccountDetailModal({
  open,
  onOpenChange,
  account,
  onUpdate,
  onDelete,
}: AccountDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAccount, setEditedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setEditedAccount({ ...account });
    }
  }, [account]);

  if (!account || !editedAccount) return null;

  const handleSave = async () => {
    setIsLoading(true);
    onUpdate(editedAccount);
    setIsEditing(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    setEditedAccount({ ...account });
    setIsEditing(false);
  };

  const handleToggleStatus = async () => {
    const newStatus = editedAccount.isActive === 1 ? 0 : 1;
    const updatedAccount = { ...editedAccount, isActive: newStatus };
    setEditedAccount(updatedAccount);
    onUpdate(updatedAccount);
  };

  const handleDelete = () => {
    const confirmMessage = `Bạn có chắc chắn muốn xóa tài khoản "${
      account.displayName || "Không tên"
    }"?\n\nHành động này không thể hoàn tác!`;
    if (confirm(confirmMessage)) {
      onDelete();
    }
  };

  const getStatusInfo = (isActive: number) => {
    switch (isActive) {
      case 1:
        return {
          icon: CheckCircle,
          text: "Đang hoạt động",
          color: "text-green-600",
          bgColor: "bg-green-100",
        };
      case 0:
        return {
          icon: XCircle,
          text: "Tạm dừng",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
      default:
        return {
          icon: AlertTriangle,
          text: "Lỗi kết nối",
          color: "text-red-600",
          bgColor: "bg-red-100",
        };
    }
  };

  const statusInfo = getStatusInfo(editedAccount.isActive);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Chi tiết tài khoản Zalo</span>
            <div className="flex space-x-2">
              {!isEditing ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Tổng quan</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            <TabsTrigger value="data">Dữ liệu</TabsTrigger>
            <TabsTrigger value="security">Bảo mật</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={editedAccount.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback>
                      {editedAccount.displayName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge
                        variant={
                          editedAccount.type === 1 ? "default" : "secondary"
                        }
                      >
                        {editedAccount.type === 1 ? (
                          <>
                            <QrCode className="w-3 h-3 mr-1" />
                            QR Code
                          </>
                        ) : (
                          <>
                            <Cookie className="w-3 h-3 mr-1" />
                            Cookie
                          </>
                        )}
                      </Badge>
                      <div
                        className={`flex items-center space-x-1 px-2 py-1 rounded-full ${statusInfo.bgColor}`}
                      >
                        <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
                        <span
                          className={`text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Tên hiển thị</Label>
                    <Input
                      id="displayName"
                      value={editedAccount.displayName || ""}
                      onChange={(e) =>
                        setEditedAccount({
                          ...editedAccount,
                          displayName: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                    <Input
                      id="phoneNumber"
                      value={editedAccount.phoneNumber || ""}
                      onChange={(e) =>
                        setEditedAccount({
                          ...editedAccount,
                          phoneNumber: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status & Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Trạng thái & Hoạt động
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">
                        Lần cập nhật cuối
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(
                        editedAccount.lastUpdateTime || Date.now()
                      ).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Ngày tạo</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(editedAccount.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Cài đặt đồng bộ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Tự động đồng bộ</h4>
                    <p className="text-sm text-gray-500">
                      Tự động cập nhật tin nhắn mới
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Thông báo tin nhắn</h4>
                    <p className="text-sm text-gray-500">
                      Hiển thị thông báo khi có tin nhắn mới
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lưu trữ media</h4>
                    <p className="text-sm text-gray-500">
                      Tự động tải và lưu ảnh, video
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Chế độ ẩn danh</h4>
                    <p className="text-sm text-gray-500">
                      Không hiển thị trạng thái đã đọc
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cài đặt nâng cao</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Khoảng thời gian đồng bộ (giây)</Label>
                  <Input type="number" defaultValue="30" min="10" max="300" />
                </div>

                <div>
                  <Label>Số tin nhắn tối đa mỗi lần đồng bộ</Label>
                  <Input type="number" defaultValue="100" min="10" max="1000" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Thống kê dữ liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      1,234
                    </div>
                    <div className="text-sm text-blue-600">
                      Tin nhắn đã đồng bộ
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">56</div>
                    <div className="text-sm text-green-600">
                      Cuộc trò chuyện
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      2.3 GB
                    </div>
                    <div className="text-sm text-purple-600">
                      Dung lượng media
                    </div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">15</div>
                    <div className="text-sm text-orange-600">
                      Ngày hoạt động
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quản lý dữ liệu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Xuất dữ liệu tin nhắn
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Sao lưu cài đặt
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa cache
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả dữ liệu
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Thông tin xác thực
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editedAccount.type === 1 ? (
                  <div>
                    <Label>Dữ liệu QR Code</Label>
                    <Textarea
                      value={editedAccount.qrData || ""}
                      onChange={(e) =>
                        setEditedAccount({
                          ...editedAccount,
                          qrData: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Cookie Data</Label>
                    <Textarea
                      value={editedAccount.cookies || ""}
                      onChange={(e) =>
                        setEditedAccount({
                          ...editedAccount,
                          cookies: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <div className="text-sm text-yellow-800">
                    <strong>Cảnh báo:</strong> Thông tin xác thực rất quan
                    trọng. Không chia sẻ với người khác.
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bảo mật tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Làm mới token xác thực
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Wifi className="w-4 h-4 mr-2" />
                  Kiểm tra kết nối
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600"
                >
                  <WifiOff className="w-4 h-4 mr-2" />
                  Ngắt kết nối tạm thời
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa tài khoản
          </Button>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
            {isEditing && (
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
