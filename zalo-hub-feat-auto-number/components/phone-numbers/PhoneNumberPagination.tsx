import { Button } from "@/components/ui/button";

interface PhoneNumberPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSize?: boolean;
  borderPosition?: "top" | "bottom";
  pageSizeOptions?: readonly number[];
  isLoading?: boolean;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500] as const;

export function PhoneNumberPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSize = false,
  borderPosition = "top",
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading = false,
}: PhoneNumberPaginationProps) {
  if (total === 0) {
    return null;
  }

  const borderClass = borderPosition === "top" ? "border-b" : "border-t";
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-4 ${borderClass} border-gray-200 bg-gray-50`}
    >
      <div className="text-sm text-gray-500">
        Hiển thị {(page - 1) * pageSize + 1} -{" "}
        {Math.min(page * pageSize, total)} / {total}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
              disabled={isLoading}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || isLoading}
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || isLoading}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
