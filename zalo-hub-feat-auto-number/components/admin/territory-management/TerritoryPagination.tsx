"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface TerritoryPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TerritoryPagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
}: TerritoryPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      if (totalPages > 6) {
        pages.push("...");
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - 3) {
      pages.push(1);
      if (totalPages > 6) pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-500">
        Hiển thị {(currentPage - 1) * pageSize + 1} đến{" "}
        {Math.min(currentPage * pageSize, total)} trong tổng số {total} kết quả
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </Button>

        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === "number" ? (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span className="px-2 text-gray-500">...</span>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}
