import React from "react";

interface RecommendedUserProps {
  thumb?: string;
  name: string;
  phone: string;
  qrImage?: string;
}

export const RecommendedUser: React.FC<RecommendedUserProps> = ({
  name,
  phone,
  qrImage,
  thumb,
}) => {
  return (
    <div className="flex items-center bg-blue-600 rounded-xl p-4 text-white w-[350px]">
      <div className="w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center font-bold text-lg mr-4 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>
            {name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-xs opacity-80">{phone}</div>
      </div>
      {qrImage && (
        <img
          src={qrImage}
          alt="QR code"
          className="w-16 h-16 bg-white rounded-lg"
        />
      )}
    </div>
  );
};
