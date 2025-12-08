"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, X, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/lib/api/user";
import { TerritoryManagementHeader } from "@/components/admin/territory-management/TerritoryManagementHeader";
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
import { useDebounce } from "@/hooks/use-debounce";

type TerritoryUser = { id: number; name: string; email: string };
type TerritoryDetail = {
  id: number;
  name: string;
  manager?: { id: number; name: string; email: string } | null;
  users: TerritoryUser[];
};

export default function TerritoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: territory, isLoading } = useQuery({
    queryKey: ["territory", id],
    queryFn: async () => api.get<TerritoryDetail>(`/territories/${id}`),
    enabled: !!id,
  });

  const [memberSearch, setMemberSearch] = useState("");
  const debouncedMemberSearch = useDebounce(memberSearch, 300);
  const [selectedUsers, setSelectedUsers] = useState<TerritoryUser[]>([]);
  const [name, setName] = useState("");
  const [managerOpen, setManagerOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (territory) {
      setSelectedUsers(territory.users || []);
      setName(territory.name || "");
      setSelectedManager(
        territory.manager
          ? {
              id: territory.manager.id,
              name: territory.manager.name,
              email: territory.manager.email,
            }
          : null
      );
    }
  }, [territory]);

  const { data: userSearchResult, isLoading: isSearching } = useQuery({
    queryKey: [
      "user-search",
      { name: debouncedMemberSearch, role: "user", active: 1 },
    ],
    queryFn: async () =>
      userApi.searchUsers({
        name: debouncedMemberSearch || undefined,
        role: "user",
        active: 1,
      }),
    enabled: !!debouncedMemberSearch,
  });
  const [managerSearch, setManagerSearch] = useState("");
  const debouncedManagerSearch = useDebounce(managerSearch, 300);
  const { data: managerSearchResult, isLoading: isManagerSearching } = useQuery(
    {
      queryKey: [
        "user-search",
        { name: debouncedManagerSearch, role: "manager", active: 1 },
      ],
      queryFn: async () =>
        userApi.searchUsers({
          name: debouncedManagerSearch || undefined,
          role: "manager",
          active: 1,
        }),
      enabled: managerOpen && !!debouncedManagerSearch,
    }
  );

  const existingIds = useMemo(
    () => new Set((selectedUsers || []).map((u) => u.id)),
    [selectedUsers]
  );

  const saveMembersMutation = useMutation({
    mutationFn: async () => {
      const userIds = selectedUsers.map((u) => u.id);
      await api.put(`/territories/${id}`, {
        name,
        userIds,
        managerId: selectedManager?.id,
      });
    },
    onSuccess: async () => {
      toast.success("Cập nhật thành viên thành công");
      await queryClient.invalidateQueries({ queryKey: ["territory", id] });
    },
    onError: (e: any) => toast.error(e?.message || "Cập nhật thất bại"),
  });

  const handleAddUser = (u: TerritoryUser) => {
    if (existingIds.has(u.id)) return;
    setSelectedUsers((prev) => [...prev, u]);
    toast.success(`Đã thêm ${u.name}`);
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (isLoading || !territory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TerritoryManagementHeader
        onBack={() => router.push("/admin/territories")}
        isAdmin={true}
        onOpenAdminUsers={() => router.push("/admin/users")}
        onOpenTerritories={() => router.push("/admin/territories")}
        onOpenAccounts={() => router.push("/accounts")}
        onOpenChangePassword={() => router.push("/dashboard?changePassword=1")}
        onLogout={() => {
          try {
            if (typeof window !== "undefined") {
              localStorage.removeItem("access_token");
            }
          } catch {}
          router.push("/auth/login");
        }}
        rightActions={
          <Button
            onClick={() => saveMembersMutation.mutate()}
            disabled={saveMembersMutation.isPending}
          >
            {saveMembersMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        }
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhóm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Tên nhóm</div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên nhóm"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500">Quản lý</div>
                <Popover open={managerOpen} onOpenChange={setManagerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={managerOpen}
                      className="w-full justify-between"
                    >
                      {selectedManager
                        ? `${selectedManager.name} (${selectedManager.email})`
                        : "Chọn quản lý"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-80 overflow-y-auto">
                    <Command>
                      <CommandInput
                        placeholder="Tìm quản lý..."
                        value={managerSearch}
                        onValueChange={setManagerSearch}
                      />
                      {managerOpen && debouncedManagerSearch && (
                        <div className="px-3 py-1 text-xs text-gray-500">
                          Tìm thấy{" "}
                          {
                            (
                              (managerSearchResult as unknown as TerritoryUser[]) ||
                              []
                            ).length
                          }{" "}
                          kết quả
                        </div>
                      )}
                      <CommandEmpty>Không tìm thấy</CommandEmpty>
                      <CommandGroup>
                        {(
                          (managerSearchResult as unknown as TerritoryUser[]) ||
                          []
                        ).map((m) => (
                          <CommandItem
                            key={m.id}
                            value={`${m.name} ${m.email}`}
                            onSelect={() => {
                              setSelectedManager({
                                id: m.id as unknown as number,
                                name: m.name,
                                email: m.email,
                              });
                              setManagerOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedManager?.id ===
                                  (m.id as unknown as number)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {m.name} ({m.email})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {isManagerSearching && (
                        <div className="p-2 text-xs text-gray-500">
                          Đang tìm...
                        </div>
                      )}
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Thành viên</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Tìm người dùng để thêm..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-64"
                />
                <Button variant="outline" disabled>
                  <UserPlus className="w-4 h-4 mr-2" /> Thêm
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {memberSearch && (
              <div className="mb-4 border rounded-lg max-h-96 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-gray-500 sticky top-0 z-10 bg-white border-b shadow-sm">
                  Tìm thấy {(userSearchResult || []).length} kết quả
                </div>
                <div className="divide-y">
                  {(userSearchResult || [])
                    .filter((u) => !existingIds.has(u.id as unknown as number))
                    .map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              <Users className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <div className="font-medium truncate">{u.name}</div>
                            <div className="text-sm text-gray-500 truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleAddUser({
                              id: u.id as unknown as number,
                              name: u.name,
                              email: u.email,
                            })
                          }
                        >
                          <UserPlus className="w-4 h-4 mr-1" /> Thêm
                        </Button>
                      </div>
                    ))}
                </div>
                {isSearching && (
                  <div className="p-3 text-sm text-gray-500">Đang tìm...</div>
                )}
                {userSearchResult && (userSearchResult || []).length === 0 && (
                  <div className="p-3 text-sm text-gray-500">
                    Không tìm thấy người dùng
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              {selectedUsers.length === 0 && (
                <div className="text-sm text-gray-500">
                  Chưa có thành viên nào
                </div>
              )}
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        <Users className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
