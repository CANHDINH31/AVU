import React from "react";

interface LinkifyTextProps {
  text: string;
}

export const LinkifyText: React.FC<LinkifyTextProps> = ({ text }) => {
  // Regex nhận diện link (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const parts = text.split(urlRegex);
  return (
    <>
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          let href = part;
          if (!href.startsWith("http")) {
            href = "http://" + href;
          }
          return (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4093ee] no-underline break-all hover:no-underline"
            >
              {part}
            </a>
          );
        }
        return (
          <span key={i} className="text-black">
            {part}
          </span>
        );
      })}
    </>
  );
};
