"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { type User } from "@/lib/auth";
import { setUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (userData: User) => {
    setUser(userData);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => router.push("/auth/register")}
        />
      </div>
    </div>
  );
}
