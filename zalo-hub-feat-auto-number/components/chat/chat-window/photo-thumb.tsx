import React, { useState } from "react";

type PhotoThumbProps = {
  url?: string;
  /**
   * Chiều dài (height) tối đa của thumbnail.
   * Mặc định 192 để tương thích với hành vi cũ.
   */
  size?: number;
};

// Component hiển thị 1 ảnh thumb, click phóng to
const PhotoThumbComponent = ({ url, size = 192 }: PhotoThumbProps) => {
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  if (!url) {
    return (
      <div
        className="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center"
        style={{ height: size, maxHeight: size }}
      >
        <span className="text-gray-400">No Image</span>
      </div>
    );
  }
  return (
    <>
      <div
        className="z-[2] w-full h-full rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in bg-gray-100 relative"
        onClick={() => setZoomedImg(url)}
        style={{ height: size, maxHeight: size }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          src={url}
          alt="Ảnh"
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ aspectRatio: "1/1", maxHeight: size }}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      {zoomedImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setZoomedImg(null)}
          style={{ cursor: "zoom-out" }}
        >
          <img
            src={zoomedImg}
            alt="Ảnh phóng to"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}
    </>
  );
};
export const PhotoThumb = React.memo(PhotoThumbComponent);
