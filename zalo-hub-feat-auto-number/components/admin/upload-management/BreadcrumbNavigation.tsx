import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbItem as BreadcrumbItemType } from "./lib";

interface BreadcrumbNavigationProps {
  breadcrumb: BreadcrumbItemType[];
  onNavigate: (path: string) => Promise<void>;
}

export function BreadcrumbNavigation({
  breadcrumb,
  onNavigate,
}: BreadcrumbNavigationProps) {
  const isAtRoot = breadcrumb.length <= 1;
  const parentPath =
    breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].path : "";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header section with title and back button */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 7h7l2 2h9v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Đường dẫn hiện tại
              </h3>
              <p className="text-xs text-gray-500">Navigation breadcrumb</p>
            </div>
          </div>

          {!isAtRoot && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await onNavigate(parentPath);
              }}
              className="h-9 px-4 text-sm border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb content */}
      <div className="px-6 py-4">
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              {(breadcrumb || []).map((c, idx) => {
                const isLast = idx === (breadcrumb?.length || 1) - 1;
                return (
                  <React.Fragment key={c.path || "root"}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="text-gray-900 font-semibold text-sm">
                          {idx === 0 ? "uploads" : c.name}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          asChild
                          className="cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={async () => {
                            await onNavigate(c.path);
                          }}
                        >
                          <span className="text-gray-600 text-sm font-medium hover:text-blue-600">
                            {idx === 0 ? "uploads" : c.name}
                          </span>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </div>
  );
}
