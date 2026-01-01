"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { UserSearchFiltersProps } from "./types";
import { userRankApi } from "@/lib/api/user-rank";

export function UserSearchFilters({
  searchTerm,
  pageSize,
  activeFilter,
  roleFilter,
  rankFilter,
  onSearchChange,
  onPageSizeChange,
  onActiveFilterChange,
  onRoleFilterChange,
  onRankFilterChange,
}: UserSearchFiltersProps) {
  // Load ranks for filter
  const { data: ranks = [], isLoading: isLoadingRanks } = useQuery({
    queryKey: ["user-ranks"],
    queryFn: userRankApi.getAll,
  });
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={
                activeFilter === undefined ? "all" : activeFilter.toString()
              }
              onValueChange={(value) =>
                onActiveFilterChange(
                  value === "all" ? undefined : Number(value)
                )
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="1">Đã kích hoạt</SelectItem>
                <SelectItem value="0">Chưa kích hoạt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={roleFilter || "all"}
              onValueChange={(value) =>
                onRoleFilterChange(value === "all" ? undefined : value)
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Quyền" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả role</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Select
              value={rankFilter === undefined ? "all" : rankFilter.toString()}
              onValueChange={(value) =>
                onRankFilterChange(value === "all" ? undefined : Number(value))
              }
              disabled={isLoadingRanks}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rank</SelectItem>
                {ranks.map((rank) => (
                  <SelectItem key={rank.id} value={rank.id.toString()}>
                    {rank.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label htmlFor="pageSize">Hiển thị:</Label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">21</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
