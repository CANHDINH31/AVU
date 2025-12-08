"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users } from "lucide-react";
import { UserTableProps } from "./types";
import { UserRow } from "./UserRow";
import { UserPagination } from "./UserPagination";
import { EditUserDialog } from "./EditUserDialog";

export function UserTable({
  users,
  isLoading,
  total,
  onEditUser,
  onDeleteUser,
  onActivate,
  onDeactivate,
  onChangePassword,
  onUpdateRole,
  isEditDialogOpen,
  selectedUser,
  updateRoleMutation,
  deleteUserMutation,
  activateMutation,
  deactivateMutation,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: UserTableProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách người dùng</CardTitle>
            <div className="text-sm text-gray-500">
              Tổng: {total} người dùng
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy người dùng
              </h3>
              <p className="text-gray-500">
                Chưa có người dùng nào trong hệ thống
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Quyền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        onEdit={onEditUser}
                        onDelete={onDeleteUser}
                        onActivate={onActivate}
                        onDeactivate={onDeactivate}
                        onChangePassword={onChangePassword}
                        isEditDialogOpen={isEditDialogOpen}
                        selectedUser={selectedUser}
                        updateRoleMutation={updateRoleMutation}
                        deleteUserMutation={deleteUserMutation}
                        activateMutation={activateMutation}
                        deactivateMutation={deactivateMutation}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <EditUserDialog
          isOpen={isEditDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              onEditUser(null as any);
            }
          }}
          user={selectedUser}
          selectedUser={selectedUser}
          onSelectedUserChange={onEditUser}
          onUpdateRole={onUpdateRole}
          updateRoleMutation={updateRoleMutation}
        />
      )}

      <UserPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </>
  );
}
