"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { PhoneNumbersManagement } from "@/components/phone-numbers/phone-numbers-management";

function PhoneNumbersContent() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard");
  };

  return <PhoneNumbersManagement onBack={handleBack} isAdmin={false} />;
}

export default function PhoneNumbersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <PhoneNumbersContent />
    </Suspense>
  );
}
