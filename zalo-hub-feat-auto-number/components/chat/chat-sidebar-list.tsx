"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Users } from "lucide-react";
import { Conversation } from "@/lib/types/conversation";
import { ConversationItem } from "./conversation-item";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

interface ChatSidebarListProps {
  isLoading: boolean;
  conversations: Conversation[];
  filteredConversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
  onPinToggle?: () => void;
  filterMode: "all" | "byAccount" | "strangers";
  selectedAccountId: string;
  shouldScroll?: boolean;
}

export interface ChatSidebarListRef {
  scrollToConversation: (conversationId: string) => void;
}

export const ChatSidebarList = React.memo(
  forwardRef<ChatSidebarListRef, ChatSidebarListProps>(
    (
      {
        isLoading,
        filteredConversations,
        selectedConversation,
        onSelectConversation,
        onPinToggle,
        filterMode,
        selectedAccountId,
        shouldScroll = false,
      },
      forwardedRef
    ) => {
      // Ref cho container và List component
      const containerRef = useRef<HTMLDivElement>(null);
      const listRef = useRef<List>(null);

      // Memo hóa callback để tránh thay đổi reference không cần thiết
      const handleSelect = useCallback(
        (id: string) => {
          onSelectConversation(id);
        },
        [onSelectConversation]
      );

      // Memo hóa conversations để tránh render lại không cần thiết
      const items = useMemo(
        () => filteredConversations,
        [filteredConversations]
      );

      // Đo chiều cao thực tế của ConversationItem đầu tiên
      const measureRef = useRef<HTMLDivElement>(null);
      const DEFAULT_ITEM_SIZE = 76;
      const [itemSize, setItemSize] = useState(DEFAULT_ITEM_SIZE); // fallback mặc định
      const [isClient, setIsClient] = useState(false);
      const [containerHeight, setContainerHeight] = useState(0);

      // Expose scrollToConversation method
      useImperativeHandle(forwardedRef, () => ({
        scrollToConversation: (conversationId: string) => {
          if (listRef.current && shouldScroll) {
            const index = items.findIndex(
              (item) => item.id.toString() === conversationId
            );
            if (index !== -1) {
              listRef.current.scrollToItem(index, "center");
            }
          }
        },
      }));

      useEffect(() => {
        setIsClient(true);
      }, []);

      // Theo dõi chiều cao container để List chiếm trọn không gian còn lại
      useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const updateHeight = () => {
          setContainerHeight(node.clientHeight || 0);
        };

        updateHeight();

        const resizeObserver =
          typeof ResizeObserver !== "undefined"
            ? new ResizeObserver(updateHeight)
            : null;

        if (resizeObserver) {
          resizeObserver.observe(node);
        } else {
          window.addEventListener("resize", updateHeight);
        }

        return () => {
          if (resizeObserver) {
            resizeObserver.disconnect();
          } else {
            window.removeEventListener("resize", updateHeight);
          }
        };
      }, []);

      // Chỉ đo lại chiều cao khi itemSize là mặc định và có ref
      useEffect(() => {
        if (
          measureRef.current &&
          itemSize === DEFAULT_ITEM_SIZE &&
          items.length > 0
        ) {
          const height = measureRef.current.offsetHeight;
          if (height && height !== itemSize) {
            setItemSize(height);
          }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [items.length, isClient]);

      // Chiều cao tổng thể list - memo hóa để tránh thay đổi không cần thiết
      const LIST_HEIGHT = useMemo(() => {
        if (containerHeight > 0) {
          return containerHeight;
        }
        // Fallback khi chưa đo được chiều cao container
        return Math.min(600, itemSize * items.length);
      }, [containerHeight, itemSize, items.length]);

      // Item renderer cho react-window - tối ưu dependencies
      const Row = useCallback(
        ({ index, style }: ListChildComponentProps) => {
          const conversation = items[index];
          const isSelected =
            selectedConversation === conversation.id.toString().trim();

          return (
            <div style={style} key={conversation.id}>
              <ConversationItem
                conversation={conversation}
                isSelected={isSelected}
                onSelect={handleSelect}
                onPinToggle={onPinToggle}
              />
            </div>
          );
        },
        [items, selectedConversation, handleSelect, onPinToggle]
      );

      // Hàm tạo thông báo khi không có cuộc trò chuyện
      const getEmptyMessage = () => {
        if (filterMode === "byAccount" && selectedAccountId) {
          return "Không có cuộc trò chuyện nào cho tài khoản này";
        } else if (filterMode === "strangers") {
          return "Không có cuộc trò chuyện với người lạ nào";
        }
        return "Không có cuộc trò chuyện nào";
      };

      // Key ổn định cho List để tránh remount
      const listKey = useMemo(() => {
        return `conversation-list-${items.length}`;
      }, [items.length]);

      return (
        <div ref={containerRef} className="flex-1 overflow-y-auto relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500">
                  Đang tải danh sách hội thoại...
                </p>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex flex-col items-center space-y-2">
                <Users className="w-8 h-8 text-gray-500" />
                <p className="text-sm text-gray-500">{getEmptyMessage()}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Render ẩn item đầu tiên để đo chiều cao, chỉ khi đã vào client và itemSize là mặc định */}
              {isClient &&
                items.length > 0 &&
                itemSize === DEFAULT_ITEM_SIZE && (
                  <div
                    style={{
                      visibility: "hidden",
                      position: "absolute",
                      pointerEvents: "none",
                      height: 0,
                      overflow: "hidden",
                    }}
                  >
                    <div ref={measureRef}>
                      <ConversationItem
                        conversation={items[0]}
                        isSelected={false}
                        onSelect={handleSelect}
                        onPinToggle={onPinToggle}
                      />
                    </div>
                  </div>
                )}
              <List
                ref={listRef}
                key={listKey}
                height={LIST_HEIGHT}
                itemCount={items.length}
                itemSize={itemSize}
                width={"100%"}
                itemKey={(index) => items[index].id}
              >
                {Row}
              </List>
            </>
          )}
        </div>
      );
    }
  )
);

ChatSidebarList.displayName = "ChatSidebarList";
