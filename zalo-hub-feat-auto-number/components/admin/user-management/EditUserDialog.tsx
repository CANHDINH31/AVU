"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getRoleBadgeVariant, getRoleIcon, getRankBadgeColor } from "./utils";
import { userRankApi } from "@/lib/api/user-rank";

export function EditUserDialog({
  isOpen,
  onOpenChange,
  user,
  selectedUser,
  onSelectedUserChange,
  onUpdateRole,
  onUpdateRank,
  updateRoleMutation,
  updateRankMutation,
}: EditUserDialogProps) {
  // Load ranks
  const { data: ranks = [], isLoading: isLoadingRanks } = useQuery({
    queryKey: ["user-ranks"],
    queryFn: userRankApi.getAll,
  });

  // Initialize selectedUser when dialog opens or user changes
  React.useEffect(() => {
    if (isOpen && !selectedUser) {
      onSelectedUserChange(user);
    }
  }, [isOpen, user, selectedUser, onSelectedUserChange]);

  const handleUpdate = () => {
    if (selectedUser) {
      // Update role if changed
      if (selectedUser.role !== user.role) {
        onUpdateRole(user.id, selectedUser.role);
      }
      // Update rank if changed
      const currentRankId = user.rankId ?? null;
      const newRankId = selectedUser.rankId ?? null;
      if (newRankId !== currentRankId && newRankId !== null) {
        onUpdateRank?.(user.id, newRankId);
      }
    }
  };

  // Normalize rankId for comparison (treat undefined and null as the same)
  const currentRankId = user.rankId ?? null;
  const newRankId = selectedUser?.rankId ?? null;

  const hasChanges = Boolean(
    selectedUser &&
      (selectedUser.role !== user.role || newRankId !== currentRankId)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật thông tin người dùng</DialogTitle>
          <DialogDescription>
            Thay đổi quyền hạn và rank cho {user.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Quyền hiện tại</Label>
            <div className="mt-1">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {getRoleIcon(user.role)}
                <span className="ml-1 capitalize">{user.role}</span>
              </Badge>
            </div>
          </div>
          <div>
            <Label htmlFor="new-role">Quyền mới</Label>
            <Select
              value={selectedUser?.role || user.role}
              onValueChange={(value) =>
                onSelectedUserChange({
                  ...user,
                  ...selectedUser,
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
          <div>
            <Label>Rank hiện tại</Label>
            <div className="mt-1">
              {user.rank ? (
                <Badge
                  variant="outline"
                  className={getRankBadgeColor(user.rank.name)}
                >
                  {user.rank.displayName}
                </Badge>
              ) : (
                <span className="text-gray-400 text-sm">Chưa có rank</span>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="new-rank">Rank mới</Label>
            <Select
              value={
                selectedUser?.rankId?.toString() ||
                user.rankId?.toString() ||
                ""
              }
              onValueChange={(value) =>
                onSelectedUserChange({
                  ...user,
                  ...selectedUser,
                  rankId: parseInt(value),
                })
              }
              disabled={isLoadingRanks}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn rank" />
              </SelectTrigger>
              <SelectContent>
                {ranks.map((rank) => (
                  <SelectItem key={rank.id} value={rank.id.toString()}>
                    {rank.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={
              !hasChanges ||
              updateRoleMutation.isPending ||
              updateRankMutation?.isPending
            }
          >
            {updateRoleMutation.isPending || updateRankMutation?.isPending
              ? "Đang cập nhật..."
              : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
