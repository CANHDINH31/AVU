"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userRankApi, UserRank, UserRankStats } from "@/lib/api/user-rank";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { RankManagementHeader } from "./RankManagementHeader";
import { RankStats } from "./RankStats";
import { RankTable } from "./RankTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RankManagementProps {
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenRanks?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
}

export function RankManagement({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenRanks,
  onOpenUploads,
  onLogout,
}: RankManagementProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<UserRank | null>(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [maxAccounts, setMaxAccounts] = useState<number>(0);
  const [order, setOrder] = useState<number>(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rankToDelete, setRankToDelete] = useState<UserRank | null>(null);

  const { data: ranks = [], isLoading } = useQuery({
    queryKey: ["user-ranks"],
    queryFn: () => userRankApi.getAll(),
  });

  const { data: statsData = [], isLoading: isStatsLoading } = useQuery({
    queryKey: ["user-ranks", "stats"],
    queryFn: () => userRankApi.getStats(),
  });

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (!name || !displayName) {
        throw new Error("Vui lòng điền đầy đủ thông tin");
      }

      const payload = {
        name,
        displayName,
        maxAccounts,
        order,
      };

      if (editing) {
        return userRankApi.update(editing.id, payload);
      }
      return userRankApi.create(payload);
    },
    onSuccess: () => {
      toast.success(
        editing ? "Cập nhật rank thành công" : "Tạo rank thành công"
      );
      setIsOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["user-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["user-ranks", "stats"] });
    },
    onError: (e: any) => {
      toast.error(
        e?.message || (editing ? "Lỗi cập nhật rank" : "Lỗi tạo rank")
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => userRankApi.delete(id),
    onSuccess: () => {
      toast.success("Xóa rank thành công");
      queryClient.invalidateQueries({ queryKey: ["user-ranks"] });
      queryClient.invalidateQueries({ queryKey: ["user-ranks", "stats"] });
      setDeleteConfirmOpen(false);
      setRankToDelete(null);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Lỗi xóa rank");
    },
  });

  const resetForm = () => {
    setEditing(null);
    setName("");
    setDisplayName("");
    setMaxAccounts(0);
    setOrder(1);
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (rank: UserRank) => {
    setEditing(rank);
    setName(rank.name);
    setDisplayName(rank.displayName);
    setMaxAccounts(rank.maxAccounts);
    setOrder(rank.order);
    setIsOpen(true);
  };

  const handleDelete = (rank: UserRank) => {
    setRankToDelete(rank);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (rankToDelete) {
      deleteMutation.mutate(rankToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RankManagementHeader
        onBack={onBack}
        isAdmin={isAdmin}
        onOpenChangePassword={onOpenChangePassword}
        onOpenAccounts={onOpenAccounts}
        onOpenAdminUsers={onOpenAdminUsers}
        onOpenTerritories={onOpenTerritories}
        onOpenRanks={onOpenRanks}
        onOpenUploads={onOpenUploads}
        onLogout={onLogout}
        onCreateRankClick={isAdmin ? openCreate : undefined}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Danh sách Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <RankTable
              ranks={ranks}
              isLoading={isLoading}
              onEdit={isAdmin ? openEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
            />
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Cập nhật Rank" : "Tạo Rank Mới"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Tên Rank (key)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="vd: kim_cuong, vang, bac, dong"
                  disabled={!!editing}
                />
              </div>
              <div>
                <Label htmlFor="displayName">Tên Hiển Thị</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="vd: Kim Cương, Vàng, Bạc, Đồng"
                />
              </div>
              <div>
                <Label htmlFor="maxAccounts">Số Tài Khoản Tối Đa</Label>
                <Input
                  id="maxAccounts"
                  type="number"
                  min="0"
                  value={maxAccounts}
                  onChange={(e) =>
                    setMaxAccounts(parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="order">Thứ Tự (1 = cao nhất)</Label>
                <Input
                  id="order"
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => upsertMutation.mutate()}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending
                  ? "Đang lưu..."
                  : editing
                  ? "Cập nhật"
                  : "Tạo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <ConfirmDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDelete}
          title="Xác nhận xóa rank"
          description={`Bạn có chắc chắn muốn xóa rank "${rankToDelete?.displayName}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
        />
      </div>
    </div>
  );
}
