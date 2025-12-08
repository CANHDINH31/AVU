"use client";

import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <RegisterForm onSwitchToLogin={() => router.push("/auth/login")} />
      </div>
    </div>
  );
}
