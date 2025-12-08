import React, { useEffect } from "react";
import { UserReactionItem } from "./user-reaction-item";
import { iconToEmoji } from "@/lib/utils/convertReactions";

interface MessageReactionsModalProps {
  open: boolean;
  onClose: () => void;
  emojiSidebar: any[];
  filteredReactions: any[];
  selectedEmoji: string | null;
  setSelectedEmoji: (emoji: string | null) => void;
  accountIds: string[];
}

// Helper: group reactions by user (uidFrom or msgSender) and count
function groupByUser(reactions: any[]) {
  const groups: Record<string, { user: any; count: number; rIcon: string }> =
    {};
  reactions.forEach((r) => {
    // Sử dụng msgSender nếu có, nếu không thì dùng uidFrom
    const userId = r.msgSender || r.uidFrom;
    if (!groups[userId]) {
      groups[userId] = { user: r, count: 0, rIcon: r.rIcon };
    }
    groups[userId].count += 1;
  });
  return Object.values(groups);
}

const MessageReactionsModal = ({
  open,
  onClose,
  emojiSidebar,
  filteredReactions,
  selectedEmoji,
  setSelectedEmoji,
}: MessageReactionsModalProps) => {
  const filteredSidebar = emojiSidebar.filter((item) => item.icon !== "all");

  useEffect(() => {
    if (open && !selectedEmoji && filteredSidebar.length > 0) {
      setSelectedEmoji(filteredSidebar[0].icon);
    }
  }, [open, selectedEmoji, filteredSidebar, setSelectedEmoji]);

  if (!open) return null;

  const userGroups = groupByUser(filteredReactions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      {/* Modal content */}
      <div className="relative flex rounded-2xl shadow-2xl border border-gray-200 bg-white w-[420px] max-w-full min-h-[320px] z-50">
        {/* Sidebar emoji */}
        <div className="flex flex-col items-center py-4 px-2 bg-[#f5f6fa] rounded-l-2xl min-w-[70px]">
          {filteredSidebar.map((item) => (
            <button
              key={item.icon}
              className={`w-12 h-12 flex items-center justify-center rounded-xl mb-1 transition-all duration-200
                ${
                  selectedEmoji === item.icon
                    ? "bg-blue-50 shadow-xl scale-110 text-blue-700 font-bold"
                    : "hover:bg-gray-200 text-gray-700"
                }
              `}
              style={
                selectedEmoji === item.icon
                  ? { boxShadow: "0 4px 24px 0 rgba(0, 123, 255, 0.18)" }
                  : undefined
              }
              onClick={() => setSelectedEmoji(item.icon)}
            >
              <span className="flex items-center justify-center">
                <span className="text-xl">{iconToEmoji[item.rIcon]}</span>
                <span
                  className={`text-xs font-semibold ml-1.5 ${
                    selectedEmoji === item.icon
                      ? "text-blue-700"
                      : "text-gray-500"
                  }`}
                >
                  {item.count}
                </span>
              </span>
            </button>
          ))}
        </div>
        {/* Main content */}
        <div className="flex-1 py-4 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-semibold text-gray-800">
              Biểu cảm
            </span>
            <button
              className="text-2xl text-gray-400 hover:text-gray-700 font-bold"
              onClick={onClose}
            >
              ×
            </button>
          </div>
          {/* User list */}
          <div className="mt-2">
            {userGroups.length === 0 ? (
              <div className="text-gray-400 text-base mt-8 text-center">
                Không có ai
              </div>
            ) : (
              userGroups.map((g, idx) => {
                return (
                  <UserReactionItem
                    key={idx}
                    uidFrom={g.user.msgSender || g.user.uidFrom}
                    count={g.count}
                    rIcon={g.rIcon}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageReactionsModal;
