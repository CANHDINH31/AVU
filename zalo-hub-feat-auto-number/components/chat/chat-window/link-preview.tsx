interface LinkPreviewProps {
  loadingPreview: boolean;
  linkPreview: any;
  onClose: () => void;
}

export function LinkPreview({
  loadingPreview,
  linkPreview,
  onClose,
}: LinkPreviewProps) {
  if (!loadingPreview && !linkPreview) return null;

  return (
    <div className="w-full flex justify-start mb-2">
      {loadingPreview && (
        <div className="rounded-xl border shadow-lg p-4 flex flex-col bg-white border-gray-200 animate-in fade-in duration-300 w-full max-w-3xl">
          <div className="flex items-center justify-center min-h-[64px] w-full">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 h-6 w-6"></div>
              <span className="text-sm text-gray-600 font-medium">
                Đang tìm kiếm thông tin link...
              </span>
            </div>
          </div>
        </div>
      )}
      {linkPreview && (
        <div className="rounded-xl border shadow-lg p-4 flex flex-col bg-white border-gray-200 animate-in fade-in duration-300 w-full max-w-3xl">
          <div className="flex items-start space-x-3">
            {linkPreview.thumb && (
              <img
                src={linkPreview.thumb}
                alt="preview"
                className="w-16 h-16 rounded-lg object-cover border border-gray-200 shadow-sm"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm text-gray-900 truncate flex-1">
                  {linkPreview.title}
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 ml-2 flex-shrink-0"
                  aria-label="Đóng preview"
                  type="button"
                >
                  ×
                </button>
              </div>
              <div className="text-xs text-gray-600 mb-2 truncate">
                {linkPreview.desc}
              </div>
              <a
                href={linkPreview.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium truncate block"
              >
                {linkPreview.href}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
