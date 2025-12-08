"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, UserCheck, UserX, Key } from "lucide-react";
import { UserRowProps } from "./types";
import { getRoleBadgeVariant, getRoleIcon, formatDate } from "./utils";
import { EditUserDialog } from "./EditUserDialog";

export function UserRow({
  user,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  onChangePassword,
  isEditDialogOpen,
  selectedUser,
  updateRoleMutation,
  deleteUserMutation,
  activateMutation,
  deactivateMutation,
}: UserRowProps) {
  return (
    <>
      <TableRow key={user.id}>
        <TableCell>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {user.name[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-gray-600">{user.email}</TableCell>
        <TableCell>
          <Badge variant={getRoleBadgeVariant(user.role)}>
            {getRoleIcon(user.role)}
            <span className="ml-1 capitalize">{user.role}</span>
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={user.active === 1 ? "default" : "secondary"}>
            {user.active === 1 ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" /> Đã kích hoạt
              </>
            ) : (
              <>
                <UserX className="w-3 h-3 mr-1" /> Chưa kích hoạt
              </>
            )}
          </Badge>
        </TableCell>
        <TableCell className="text-gray-600">
          {formatDate(user.createdAt)}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end space-x-1">
            {user.active === 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeactivate(user.id)}
                disabled={deactivateMutation.isPending}
                className="text-orange-600 hover:text-orange-700"
              >
                <UserX className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActivate(user.id)}
                disabled={activateMutation.isPending}
                className="text-green-600 hover:text-green-700"
              >
                <UserCheck className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onChangePassword(user.id)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Key className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
              <Edit className="w-4 h-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa người dùng "{user.name}"? Hành
                    động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(user.id)}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleteUserMutation.isPending}
                  >
                    {deleteUserMutation.isPending ? "Đang xóa..." : "Xóa"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
