"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { uploadApi } from "@/lib/api/upload";

export default function AdminUploadsPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/dashboard");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin/uploads/management");
      return;
    }

    const userId = Number(user.id);
    if (!Number.isFinite(userId)) {
      router.replace("/dashboard");
      return;
    }

    uploadApi.permissions
      .checkPermission(userId, "canRead")
      .then((res) => {
        if (res?.hasPermission) {
          router.replace("/admin/uploads/management");
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
