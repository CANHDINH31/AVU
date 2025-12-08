"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, ArrowLeft, Upload } from "lucide-react";

interface PhoneNumbersManagementHeaderProps {
  onBack?: () => void;
  isAdmin?: boolean;
  onOpenChangePassword?: () => void;
  onOpenAccounts?: () => void;
  onOpenAdminUsers?: () => void;
  onOpenTerritories?: () => void;
  onOpenUploads?: () => void;
  onLogout?: () => void;
  onCreateClick?: () => void;
  onImportClick?: () => void;
  onExportClick?: () => void;
  isImporting?: boolean;
}

export function PhoneNumbersManagementHeader({
  onBack,
  onImportClick,
  isImporting = false,
}: PhoneNumbersManagementHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            )}
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Quản lý số điện thoại khách hàng
              </h1>
              <p className="text-sm text-gray-500">
                Quản lý danh sách số điện thoại và thông tin khách hàng
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onImportClick && (
              <Button
                variant="outline"
                onClick={onImportClick}
                disabled={isImporting}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Excel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
