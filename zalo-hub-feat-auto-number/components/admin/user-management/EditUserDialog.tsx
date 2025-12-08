"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { EditUserDialogProps } from "./types";
import { getRoleBadgeVariant, getRoleIcon } from "./utils";

export function EditUserDialog({
  isOpen,
  onOpenChange,
  user,
  selectedUser,
  onSelectedUserChange,
  onUpdateRole,
  updateRoleMutation,
}: EditUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật quyền người dùng</DialogTitle>
          <DialogDescription>
            Thay đổi quyền hạn cho {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Quyền hiện tại</Label>
            <Badge variant={getRoleBadgeVariant(user.role)}>
              {getRoleIcon(user.role)}
              <span className="ml-1 capitalize">{user.role}</span>
            </Badge>
          </div>
          <div>
            <Label htmlFor="new-role">Quyền mới</Label>
            <Select
              value={selectedUser?.role || user.role}
              onValueChange={(value) =>
                onSelectedUserChange({
                  ...user,
                  role: value,
                })
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
            onClick={() =>
              onUpdateRole(user.id, selectedUser?.role || user.role)
            }
            disabled={updateRoleMutation.isPending}
          >
            {updateRoleMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
