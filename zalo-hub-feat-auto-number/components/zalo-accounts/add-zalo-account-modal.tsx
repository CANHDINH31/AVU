"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
import { accountApi, zaloApi } from "@/lib/api";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";
import { Account } from "@/lib/types/account";
import { triggerApi } from "@/lib/api";
import { toast } from "sonner";

interface AddZaloAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<Account[], Error>>;
  onAccountAdded?: (accountId: number) => void;
}

export function AddZaloAccountModal({
  open,
  onOpenChange,
  refetch,
  onAccountAdded,
}: AddZaloAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [countdown, setCountdown] = useState(0);

  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startCountdown = (seconds: number) => {
    clearTimers();
    setCountdown(seconds);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pollLoginStatus = (sessionId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await zaloApi.checkLogin(sessionId);
        if (res.loggedIn) {
          clearTimers();

          const { userId: userResponseId, key, ...rest } = res.data;

          try {
            const account = await accountApi.create({
              ...rest,
              accountKey: key,
              userZaloId: userResponseId,
              imei: res.session.imei,
              cookies: JSON.stringify(res.session.cookie),
              userAgent: res.session.userAgent,
            });

            onAccountAdded?.(account.id);

            await triggerApi.triggerCheckAccounts();

            refetch();

            onOpenChange(false);
            setQrCodeUrl("");
            setCountdown(0);
          } catch (error: any) {
            // Handle error when creating account (e.g., rank limit exceeded)
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Không thể tạo tài khoản. Vui lòng thử lại.";
            toast.error(errorMessage);
            clearTimers();
            onOpenChange(false);
            setQrCodeUrl("");
            setCountdown(0);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  const fetchQRCode = async () => {
    try {
      setIsLoading(true);
      const res = await zaloApi.getQr();
      if (res.qrImage) {
        setQrCodeUrl("data:image/png;base64," + res.qrImage);
        startCountdown(60);
        pollLoginStatus(res.sessionId);
      }
    } catch (error) {
      console.error("Error fetching QR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadQr = () => {
    clearTimers();
    setQrCodeUrl("");
    setCountdown(0);
    fetchQRCode();
  };

  useEffect(() => {
    if (open) {
      fetchQRCode();
    } else {
      clearTimers();
      setQrCodeUrl("");
      setCountdown(0);
    }

    return () => clearTimers(); // cleanup on unmount
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm tài khoản Zalo</DialogTitle>
        </DialogHeader>

        <div className="text-center py-4">
          <div className="w-64 h-64 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center relative">
            {isLoading ? (
              <div className="animate-spin h-12 w-12 border-b-2 border-gray-900 rounded-full" />
            ) : qrCodeUrl ? (
              <>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className={`w-full h-full object-contain ${
                    countdown === 0 ? "opacity-50 grayscale" : ""
                  }`}
                />
                {countdown === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReloadQr}
                      className="flex items-center space-x-2 bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Tải lại mã QR</span>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <QrCode className="w-16 h-16 text-gray-400" />
            )}
          </div>

          {qrCodeUrl && countdown > 0 && (
            <div className="flex items-center justify-center space-x-2">
              <div className="text-sm text-gray-500">Thời gian còn lại:</div>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold animate-pulse">
                {countdown} giây
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
