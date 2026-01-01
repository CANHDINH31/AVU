"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { TerritoryManagementHeader } from "./TerritoryManagementHeader";
import { TerritorySearchFilters } from "./TerritorySearchFilters";
import { TerritoryStats } from "./TerritoryStats";
import { TerritoryTable } from "./TerritoryTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type Territory = {
  id: number;
  name: string;
  manager: { id: number; name: string; email: string };
  users: { id: number; name: string; email: string }[];
};

type PaginatedTerritories = {
  data: Territory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Manager = { id: number; name: string; email: string };

interface TerritoryManagementProps {
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

export function TerritoryManagement({
  onBack,
  isAdmin = false,
  onOpenChangePassword,
  onOpenAccounts,
  onOpenAdminUsers,
  onOpenTerritories,
  onOpenRanks,
  onOpenUploads,
  onLogout,
}: TerritoryManagementProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Territory | null>(null);
  const [name, setName] = useState("");
  const [managerOpen, setManagerOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [territoryToDelete, setTerritoryToDelete] = useState<Territory | null>(
    null
  );

  const { data, isLoading } = useQuery({
    queryKey: [
      "territories",
      "paginated",
      { page: currentPage, limit: pageSize, search: searchTerm },
    ],
    queryFn: () =>
      api.get<PaginatedTerritories>("/territories/paginated", {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
      }),
  });

  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: () => api.get<Manager[]>("/user/managers"),
  });

  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["territories", "stats"],
    queryFn: () =>
      api.get<{
        totalTerritories: number;
        totalManagers: number;
        totalMembers: number;
      }>("/territories/stats"),
  });

  const territories = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const territoriesStats = {
    totalTerritories: statsData?.totalTerritories || 0,
    totalManagers: statsData?.totalManagers || 0,
    totalMembers: statsData?.totalMembers || 0,
    activeTerritories: statsData?.totalTerritories || 0,
  };

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (!selectedManager) {
        throw new Error("Vui lòng chọn Quản lý");
      }

      const payload = editing
        ? {
            name,
            managerId: selectedManager.id,
          }
        : {
            name,
            managerName: selectedManager.name,
          };

      if (editing) {
        return api.put(`/territories/${editing.id}`, payload);
      }
      return api.post(`/territories`, payload);
    },
    onSuccess: () => {
      toast("Lưu lãnh thổ thành công");
      setIsOpen(false);
      setEditing(null);
      setName("");
      setSelectedManager(null);
      queryClient.invalidateQueries({ queryKey: ["territories", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["territories", "stats"] });
    },
    onError: (e: any) => toast(e?.message || "Lỗi lưu lãnh thổ"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/territories/${id}`),
    onSuccess: () => {
      toast("Xóa lãnh thổ thành công");
      queryClient.invalidateQueries({ queryKey: ["territories", "paginated"] });
      queryClient.invalidateQueries({ queryKey: ["territories", "stats"] });
      setDeleteConfirmOpen(false);
      setTerritoryToDelete(null);
    },
    onError: (e: any) => toast(e?.message || "Lỗi xóa lãnh thổ"),
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSelectedManager(null);
    setIsOpen(true);
  };

  const openEdit = (t: Territory) => {
    router.push(`/admin/territories/${t.id}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (territory: Territory) => {
    setTerritoryToDelete(territory);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (territoryToDelete) {
      deleteMutation.mutate(territoryToDelete.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TerritoryManagementHeader
        onBack={onBack}
        isAdmin={isAdmin}
        onOpenChangePassword={onOpenChangePassword}
        onOpenAccounts={onOpenAccounts}
        onOpenAdminUsers={onOpenAdminUsers}
        onOpenTerritories={onOpenTerritories}
        onOpenRanks={onOpenRanks}
        onOpenUploads={onOpenUploads}
        onLogout={onLogout}
        onCreateTerritoryClick={openCreate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TerritorySearchFilters
          searchTerm={searchTerm}
          pageSize={pageSize}
          onSearchChange={handleSearch}
          onPageSizeChange={handlePageSizeChange}
        />

        <TerritoryStats
          territoriesStats={territoriesStats}
          isLoading={isStatsLoading}
        />

        <TerritoryTable
          territories={territories}
          isLoading={isLoading}
          total={total}
          onEdit={openEdit}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Sửa nhóm" : "Tạo nhóm"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên nhóm</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Khu vực miền Bắc"
              />
            </div>

            <div className="space-y-2">
              <Label>Quản lý</Label>
              <Popover open={managerOpen} onOpenChange={setManagerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={managerOpen}
                    className="w-full justify-between"
                  >
                    {selectedManager ? selectedManager.name : "Chọn quản lý"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]">
                  <Command>
                    <CommandInput placeholder="Tìm quản lý..." />
                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                    <CommandGroup>
                      {(managers || []).map((m) => (
                        <CommandItem
                          key={m.id}
                          value={m.id as unknown as string}
                          onSelect={() => {
                            setSelectedManager(m);
                            setManagerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedManager?.id === m.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {m.name} ({m.email})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Thành viên sẽ được thêm sau khi tạo nhóm */}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={() => upsertMutation.mutate()}
                disabled={upsertMutation.isPending}
              >
                {upsertMutation.isPending ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Xác nhận xóa lãnh thổ"
        description={`Bạn có chắc chắn muốn xóa lãnh thổ "${territoryToDelete?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={handleConfirmDelete}
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
