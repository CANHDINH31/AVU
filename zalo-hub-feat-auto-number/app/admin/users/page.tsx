"use client";

import { useRouter } from "next/navigation";
import { UserManagement } from "@/components/admin/user-management";
import { getUser, removeUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { ChangePasswordDialog } from "@/components/ui/change-password-dialog";
import { userApi } from "@/lib/api/user";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setLoading(false);

    if (!u || u.role !== "admin") {
      router.push("/dashboard");
    }
  }, [router]);

  const changePasswordMutation = useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => {
      if (!user?.id) throw new Error("Không xác định người dùng");
      return userApi.changeMyPassword(user.id, currentPassword, newPassword);
    },
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công");
      setIsChangePasswordOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Đổi mật khẩu thất bại");
    },
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      removeUser();
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <>
      <UserManagement
        onBack={handleBack}
        isAdmin={true}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onOpenAccounts={() => router.push("/accounts")}
        onOpenAdminUsers={() => router.push("/admin/users")}
        onOpenTerritories={() => router.push("/admin/territories")}
        onOpenUploads={() => router.push("/admin/uploads")}
        onLogout={handleLogout}
      />

      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        userId={user?.id || ""}
        isSubmitting={changePasswordMutation.isPending}
        onSubmit={async ({ currentPassword, newPassword }) => {
          await changePasswordMutation.mutateAsync({
            currentPassword,
            newPassword,
          });
        }}
      />
    </>
  );
}
