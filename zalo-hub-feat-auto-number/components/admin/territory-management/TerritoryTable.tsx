"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, Users, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TerritoryPagination } from "./TerritoryPagination";

type Territory = {
  id: number;
  name: string;
  manager: { id: number; name: string; email: string };
  users: { id: number; name: string; email: string }[];
};

interface TerritoryTableProps {
  territories: Territory[];
  isLoading: boolean;
  total: number;
  onEdit: (territory: Territory) => void;
  onDelete: (territory: Territory) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TerritoryTable({
  territories,
  isLoading,
  total,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
}: TerritoryTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhóm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 p-4 border rounded-lg"
              >
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (territories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhóm (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có nhóm nào
            </h3>
            <p className="text-gray-500">
              Tạo nhóm đầu tiên để bắt đầu quản lý
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Danh sách nhóm ({territories.length})</CardTitle>
          <span className="text-sm text-gray-500">Tổng: {total} nhóm</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {territories.map((territory) => (
            <div
              key={territory.id}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <Users className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {territory.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    <UserCheck className="w-3 h-3 mr-1" />
                    Quản lý
                  </Badge>
                </div>

                <div className="text-sm text-gray-500 mb-1">
                  <span className="font-medium">Quản lý:</span>{" "}
                  {territory.manager?.name || "Chưa có"}
                  {territory.manager?.email && (
                    <span className="ml-1">({territory.manager.email})</span>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <span className="font-medium">Thành viên:</span>{" "}
                  {territory.users?.length > 0 ? (
                    <span>
                      {territory.users.map((user) => user.name).join(", ")}
                    </span>
                  ) : (
                    <span className="text-gray-400">Chưa có thành viên</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(territory)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Sửa
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(territory)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>

        <TerritoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
