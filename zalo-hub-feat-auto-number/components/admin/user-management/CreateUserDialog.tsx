"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateUserDialogProps } from "./types";

export function CreateUserDialog({
  isOpen,
  onOpenChange,
  newUser,
  onNewUserChange,
  onCreateUser,
  createUserMutation,
}: CreateUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo người dùng mới</DialogTitle>
          <DialogDescription>
            Tạo tài khoản người dùng mới trong hệ thống
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                onNewUserChange({ ...newUser, email: e.target.value })
              }
              placeholder="user@example.com"
            />
          </div>
          <div>
            <Label htmlFor="name">Tên</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) =>
                onNewUserChange({ ...newUser, name: e.target.value })
              }
              placeholder="Tên người dùng"
            />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) =>
                onNewUserChange({ ...newUser, password: e.target.value })
              }
              placeholder="Mật khẩu"
            />
          </div>
          <div>
            <Label htmlFor="role">Quyền</Label>
            <Select
              value={newUser.role}
              onValueChange={(value) =>
                onNewUserChange({ ...newUser, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="manager">Quản lý</SelectItem>
                <SelectItem value="admin">Quản trị viên</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={onCreateUser}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? "Đang tạo..." : "Tạo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
