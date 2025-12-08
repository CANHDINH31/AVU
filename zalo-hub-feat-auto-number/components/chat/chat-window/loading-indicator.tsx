interface LoadingIndicatorProps {
  isFetchingNextPage: boolean;
}

export function LoadingIndicator({
  isFetchingNextPage,
}: LoadingIndicatorProps) {
  if (!isFetchingNextPage) return null;

  return (
    <div className="flex justify-center py-2">
      <span className="text-xs text-gray-400 animate-pulse">
        Đang tải thêm...
      </span>
    </div>
  );
}
