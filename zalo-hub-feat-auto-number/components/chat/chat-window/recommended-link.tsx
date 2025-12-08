import { LinkifyText } from "@/components/ui/LinkifyText";
import React from "react";

export function RecommendedLink({
  title,
  mediaTitle,
  description,
  href,
  thumb,
}: {
  title?: string;
  mediaTitle: string;
  description?: string;
  href?: string;
  thumb?: string;
}) {
  return (
    <div>
      {title && (
        <p className="text-sm whitespace-pre-wrap leading-relaxed max-w-xs mb-1">
          <span>
            <LinkifyText text={title} />
          </span>
        </p>
      )}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-xs"
        style={{ textDecoration: "none" }}
      >
        {thumb && (
          <img
            src={thumb}
            alt={mediaTitle || "thumb"}
            className="w-full h-32 object-cover bg-gray-100 dark:bg-gray-700"
            style={{ borderBottom: "1px solid #eee" }}
          />
        )}
        <div className="p-3">
          <div className="font-bold text-base mb-1 text-gray-900 dark:text-white truncate">
            {mediaTitle}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            {description}
          </div>
          <div className="text-xs text-[#4093ee] truncate">{href}</div>
        </div>
      </a>
    </div>
  );
}
