import React from "react";
import { Folder, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SharedFolder } from "@/lib/api";

interface SharedFolderMessageProps {
  folder: SharedFolder;
  message?: string;
  timestamp?: string;
  senderName?: string;
}

export function SharedFolderMessage({
  folder,
  message,
  timestamp,
  senderName,
}: SharedFolderMessageProps) {
  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Downloading folder:", folder);
  };

  const handleOpen = () => {
    // TODO: Implement open folder functionality
    console.log("Opening folder:", folder);
  };

  return (
    <div className="max-w-xs bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      {/* Folder Info */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Folder className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 text-sm truncate">
              {folder.name}
            </h4>
            {folder.type === "file" && (
              <span className="text-xs text-gray-500">
                (
                {folder.size ? `${(folder.size / 1024).toFixed(1)} KB` : "File"}
                )
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 truncate mb-2">{folder.path}</p>

          {message && <p className="text-sm text-gray-700 mb-2">{message}</p>}

          {senderName && (
            <p className="text-xs text-gray-400 mb-2">Gửi bởi {senderName}</p>
          )}

          {timestamp && (
            <p className="text-xs text-gray-400 mb-3">
              {new Date(timestamp).toLocaleString("vi-VN")}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpen}
              className="h-7 px-2 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Mở
            </Button>

            {folder.type === "file" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-7 px-2 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Tải về
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
