"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { UserPaginationProps } from "./types";

export function UserPagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
}: UserPaginationProps) {
  if (totalPages <= 1) return null;

  // Logic để hiển thị các trang một cách thông minh
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Tối đa hiển thị 7 phần tử

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang <= 7, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic hiển thị thông minh cho nhiều trang
      if (currentPage <= 4) {
        // Hiển thị các trang đầu: 1, 2, 3, 4, 5, ..., totalPages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        // Hiển thị các trang cuối: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
        pages.push(1);
        if (totalPages > 6) {
          pages.push("...");
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Hiển thị trang giữa: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
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
