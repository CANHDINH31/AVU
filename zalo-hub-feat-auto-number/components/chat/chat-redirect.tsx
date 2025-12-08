"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MessageCircle, ArrowLeft, AlertTriangle } from "lucide-react";

export function ChatRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Tự động redirect sau 3 giây
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl text-gray-900">
            Vui lòng chọn tài khoản trước
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <MessageCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Để sử dụng tính năng chat, bạn cần chọn ít nhất một tài khoản Zalo
              từ trang Dashboard.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              Đang chuyển hướng về Dashboard trong 3 giây...
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Về Dashboard ngay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
