"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRank } from "@/lib/api/user-rank";
import { Edit, Trash2 } from "lucide-react";

interface RankTableProps {
  ranks: UserRank[];
  isLoading: boolean;
  onEdit?: (rank: UserRank) => void;
  onDelete?: (rank: UserRank) => void;
}

export function RankTable({
  ranks,
  isLoading,
  onEdit,
  onDelete,
}: RankTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (ranks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chưa có rank nào. Hãy tạo rank đầu tiên!
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Thứ Tự</TableHead>
          <TableHead>Tên Rank</TableHead>
          <TableHead>Tên Hiển Thị</TableHead>
          <TableHead>Số Tài Khoản Tối Đa</TableHead>
          <TableHead>Ngày Tạo</TableHead>
          {(onEdit || onDelete) && <TableHead className="text-right">Thao Tác</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {ranks.map((rank) => (
          <TableRow key={rank.id}>
            <TableCell>{rank.order}</TableCell>
            <TableCell className="font-mono text-sm">{rank.name}</TableCell>
            <TableCell className="font-medium">{rank.displayName}</TableCell>
            <TableCell>{rank.maxAccounts}</TableCell>
            <TableCell>
              {rank.createdAt
                ? new Date(rank.createdAt).toLocaleDateString("vi-VN")
                : "-"}
            </TableCell>
            {(onEdit || onDelete) && (
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(rank)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(rank)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

