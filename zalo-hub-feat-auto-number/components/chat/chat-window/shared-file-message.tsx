import React from "react";

function getFileIcon(fileExt: string) {
  const ext = (fileExt || "").toLowerCase();
  // Văn bản
  if (["txt", "md", "rtf"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#6366F1" />
        <rect x="8" y="10" width="24" height="4" rx="2" fill="#fff" />
        <rect x="8" y="18" width="24" height="4" rx="2" fill="#fff" />
        <rect x="8" y="26" width="16" height="4" rx="2" fill="#fff" />
      </svg>
    );
  }
  // Word
  if (["doc", "docx", "odt"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#2563eb" />
        <rect x="10" y="10" width="20" height="4" rx="2" fill="#fff" />
        <rect x="10" y="18" width="20" height="4" rx="2" fill="#fff" />
        <rect x="10" y="26" width="12" height="4" rx="2" fill="#fff" />
      </svg>
    );
  }
  // Excel
  if (["xls", "xlsx", "csv", "ods"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#43A047" />
        <path
          d="M12 12l16 16M28 12L12 28"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // PowerPoint
  if (["ppt", "pptx"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#FB8C00" />
        <circle cx="20" cy="20" r="8" fill="#fff" />
        <path d="M20 12v16" stroke="#FB8C00" strokeWidth="3" />
      </svg>
    );
  }
  // PDF
  if (ext === "pdf") {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#E53935" />
        <path
          d="M10 34c6-12 18-24 24-24"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // Ảnh
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#FBC02D" />
        <circle cx="20" cy="14" r="4" fill="#fff" />
        <path
          d="M8 32l12-12 12 12"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // Âm thanh
  if (["mp3", "wav", "aac", "m4a", "ogg"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#1976D2" />
        <rect x="28" y="12" width="4" height="16" rx="2" fill="#fff" />
        <circle cx="16" cy="28" r="4" fill="#fff" />
      </svg>
    );
  }
  // Video
  if (["mp4", "avi", "mkv", "mov", "webm"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#8E24AA" />
        <polygon points="15,10 30,20 15,30" fill="#fff" />
      </svg>
    );
  }
  // File nén
  if (["zip", "rar", "7z", "tar", "gz", "tar.gz"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#F57C00" />
        <rect x="14" y="8" width="12" height="20" rx="3" fill="#fff" />
        <rect x="24" y="28" width="6" height="6" rx="3" fill="#fff" />
      </svg>
    );
  }
  // Code
  if (
    [
      "html",
      "htm",
      "css",
      "js",
      "ts",
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "php",
      "json",
      "xml",
      "sql",
      "bat",
      "sh",
    ].includes(ext)
  ) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#0288D1" />
        <path
          d="M14 14l-6 6 6 6M26 14l6 6-6 6"
          stroke="#fff"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  // Ứng dụng
  if (["exe", "apk", "dll", "iso"].includes(ext)) {
    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        className="w-10 h-10"
      >
        <rect x="0" y="0" width="40" height="40" rx="8" fill="#374151" />
        <circle cx="20" cy="20" r="12" fill="#fff" />
      </svg>
    );
  }
  // Mặc định
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className="w-10 h-10"
    >
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#90A4AE" />
    </svg>
  );
}

function formatFileSize(size: number) {
  if (!size) return "";
  if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + " MB";
  if (size >= 1024) return (size / 1024).toFixed(1) + " KB";
  return size + " B";
}

export const SharedFileMessage = ({
  file,
  isExpired = false,
}: {
  file: any;
  isExpired?: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0 flex items-center justify-center h-12 w-12">
        {getFileIcon(file.fileExt)}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-gray-800 text-sm truncate" title={file.title}>
          {file.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatFileSize(file?.size)}
          </span>
        </div>
      </div>
      {!isExpired && (
        <a
          href={file?.href}
          rel="noopener noreferrer"
          className="ml-2 p-1 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-blue-50 hover:border-blue-400 hover:shadow transition-all duration-150 flex items-center justify-center active:scale-95"
          title="Mở file"
        >
          <svg width="22" height="22" fill="none" viewBox="0 0 20 20">
            <path
              d="M10 3v10m0 0l-3.5-3.5M10 13l3.5-3.5M4 17h12"
              stroke="#2563eb"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      )}
    </div>
  );
};
