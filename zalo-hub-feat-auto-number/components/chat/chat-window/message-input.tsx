import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Paperclip,
  ImageIcon,
  Smile,
  Send,
  StickyNote,
  Video as VideoIcon,
  Folder,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import Picker from "@emoji-mart/react";
import { zaloApi } from "@/lib/api";
import { StickerPicker } from "./sticker-picker";
import { Sticker } from "@/lib/api/sticker";
import { LinkPreview } from "./link-preview";
import { Message } from "@/hooks/use-chat-messages";
import ReplyMessagePreview from "./reply-message-preview";
import { SharedFolderPicker } from "../shared-folder-picker";

interface SharedFolder {
  id: string;
  name: string;
  path: string;
  type: "folder" | "file";
  children?: SharedFolder[];
  isExpanded?: boolean;
}

export function MessageInput({
  onSendMessage,
  onAddPending,
  accountId,
  conversationId,
  replyToMessage,
  onCancelReply,
  textareaRef,
}: {
  onSendMessage: (
    msg: string | Sticker | File[] | File | SharedFolder | SharedFolder[],
    type?: string,
    replyTo?: Message,
    textareaRef?: React.RefObject<HTMLTextAreaElement>
  ) => Promise<void>;
  onAddPending?: (files: File[], kind: "attachments" | "video") => void;
  accountId: number;
  conversationId: string | null;
  replyToMessage?: Message | null;
  onCancelReply?: () => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSharedItems, setSelectedSharedItems] = useState<
    SharedFolder[]
  >([]);
  const [sendingSharedFolder, setSendingSharedFolder] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefFile = useRef<HTMLInputElement>(null);
  const fileInputRefVideo = useRef<HTMLInputElement>(null);

  // Regex phát hiện link
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  useEffect(() => {
    const urls = newMessage.match(urlRegex);
    if (urls && urls.length === 1) {
      setLinkPreview(null);
      setLoadingPreview(false);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(async () => {
        try {
          setLoadingPreview(true);
          const preview = await zaloApi.parseLink({ accountId, url: urls[0] });
          setLinkPreview(preview);
        } catch (error) {
          console.error("Error fetching link preview:", error);
        } finally {
          setLoadingPreview(false);
        }
      }, 100);
    } else {
      setLinkPreview(null);
      setLoadingPreview(false);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMessage]);

  const handleSendMessage = async () => {
    const message = newMessage.trim();
    if (!message && selectedSharedItems.length === 0) return;

    // Send text/link first if any
    if (message) {
      await onSendMessage(
        message,
        linkPreview ? "link" : "",
        replyToMessage || undefined
      );
    }

    // Send selected shared items (batch)
    if (selectedSharedItems.length > 0) {
      await onSendMessage(
        selectedSharedItems,
        "shared-folder",
        replyToMessage || undefined
      );
    }
    setNewMessage("");
    setSelectedSharedItems([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStickerSelect = async (sticker: Sticker) => {
    await onSendMessage(sticker, "sticker", replyToMessage || undefined);
  };

  const handleSharedFolderSelect = async (item: SharedFolder) => {
    setSelectedSharedItems((prev) => {
      const exists = prev.find((f) => f.id === item.id);
      if (exists) return prev.filter((f) => f.id !== item.id);
      return [...prev, item];
    });
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    onAddPending?.(files, "attachments");
    setUploading(true);
    try {
      await onSendMessage(files, "attachments", replyToMessage || undefined);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    const maxSize = 25 * 1024 * 1024; // 25MB
    const oversize = files.find((f) => f.size > maxSize);
    if (oversize) {
      alert("Mỗi file tải lên không được vượt quá 25MB!");
      e.target.value = "";
      return;
    }
    onAddPending?.(files, "attachments");
    setUploading(true);
    try {
      // TODO: Thay thế bằng API upload thực tế nếu cần
      await onSendMessage(files, "attachments", replyToMessage || undefined);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleVideoButtonClick = () => {
    fileInputRefVideo.current?.click();
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    const maxSize = 25 * 1024 * 1024; // 25MB
    const oversize = files.find((f) => f.size > maxSize);
    if (oversize) {
      alert("Mỗi video tải lên không được vượt quá 25MB!");
      e.target.value = "";
      return;
    }
    onAddPending?.(files, "video");
    setUploading(true);
    try {
      await onSendMessage(files, "attachments", replyToMessage || undefined);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-4">
      <LinkPreview
        loadingPreview={loadingPreview}
        linkPreview={linkPreview}
        onClose={() => setLinkPreview(null)}
      />

      {/* Reply Preview */}
      {replyToMessage && (
        <ReplyMessagePreview message={replyToMessage} onClose={onCancelReply} />
      )}

      {/* Selected Shared Items Preview */}
      {selectedSharedItems.length > 0 && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-700 font-medium">
                Đã chọn {selectedSharedItems.length} mục
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSharedItems([])}
              className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
              title="Bỏ chọn tất cả"
            >
              ×
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedSharedItems.map((it) => (
              <div
                key={it.id}
                className="px-2 py-1 text-xs bg-white border border-blue-200 rounded flex items-center gap-1"
              >
                <span className="max-w-[180px] truncate">{it.name}</span>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() =>
                    setSelectedSharedItems((prev) =>
                      prev.filter((f) => f.id !== it.id)
                    )
                  }
                  title="Bỏ chọn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Khung nhập message input */}
      <div className="flex items-center space-x-3 p-4 rounded-2xl border bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
        {uploading && (
          <div className="flex items-center gap-2 text-blue-500 text-sm">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Đang tải file lên...
          </div>
        )}
        {/* Attachment Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
            >
              <Paperclip className="w-5 h-5 text-gray-600" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-56 p-3 rounded-xl shadow-lg border-0"
            align="start"
          >
            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 text-gray-700"
                size="sm"
                onClick={handleImageButtonClick}
              >
                <ImageIcon className="w-4 h-4 mr-3 text-blue-500" />
                Hình ảnh
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                  multiple
                />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 text-gray-700"
                size="sm"
                onClick={handleVideoButtonClick}
              >
                <VideoIcon className="w-4 h-4 mr-3 text-blue-500" />
                Video
                <input
                  ref={fileInputRefVideo}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={handleVideoChange}
                />
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-blue-50 text-gray-700"
                size="sm"
                onClick={() => fileInputRefFile.current?.click()}
              >
                <Paperclip className="w-4 h-4 mr-3 text-blue-500" />
                Tệp tin
                <input
                  ref={fileInputRefFile}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  multiple
                />
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Shared Folder Button */}
        <SharedFolderPicker
          onToggleSelect={handleSharedFolderSelect}
          selectedIds={selectedSharedItems.map((i) => i.id)}
          accountId={accountId}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          >
            <Folder className="w-5 h-5 text-gray-600" />
          </Button>
        </SharedFolderPicker>

        {/* Sticker Button */}
        <StickerPicker
          onSelectSticker={handleStickerSelect}
          accountId={accountId}
        >
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
          >
            <StickyNote className="w-5 h-5 text-gray-600" />
          </Button>
        </StickerPicker>
        {/* Message Input + Emoji */}
        <div className="flex flex-1 items-center gap-2 min-h-0">
          <Textarea
            ref={textareaRef}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={handleTextareaInput}
            onKeyPress={handleKeyPress}
            className="min-h-10 max-h-32 resize-none overflow-y-auto border-0 bg-transparent focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 text-sm leading-normal flex-1 p-0 m-0 shadow-none py-2"
            rows={1}
          />
          {/* Emoji Button */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 p-0 m-0"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                tabIndex={0}
                type="button"
              >
                <Smile className="w-4 h-4 text-gray-600" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 rounded-xl shadow-lg border-0">
              <Picker
                onEmojiSelect={(emoji: any) => {
                  setNewMessage(newMessage + (emoji.native || ""));
                }}
                theme={"light"}
                locale="vi"
                previewPosition="none"
                searchPosition="none"
                perLine={8}
                maxFrequentRows={1}
                autoFocus={false}
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Send Button */}
        <Button
          onClick={handleSendMessage}
          size="icon"
          className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          disabled={
            (!newMessage.trim() && selectedSharedItems.length === 0) ||
            uploading ||
            sendingSharedFolder
          }
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
