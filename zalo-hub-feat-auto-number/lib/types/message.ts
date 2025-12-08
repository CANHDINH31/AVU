import { Conversation } from "./conversation";

export interface Message {
  id: number | string;

  // Sender & Receiver
  uidFrom?: string;
  idTo?: string;
  sender?: "me" | "other";
  isSelf?: number;
  senderName?: string;
  senderAvatar?: string;
  accountName?: string;

  // Metadata
  type?: number | "text" | "image" | "file" | "voice";
  msgType?: string;
  msgId?: string;
  cliMsgId?: string;
  threadId?: string;
  actionId?: string;
  conversationId?: number;
  conversation?: any;
  status?: number;
  messageStatus?: "sending" | "sent" | "failed";
  source?: "backend" | "socket";
  isExpired?: number; // 1: còn hạn, 0: hết hạn
  ts?: string;
  createdAt?: string;
  updatedAt?: string;

  // Content
  content: string;
  title?: string;
  description?: string;
  href?: string;
  thumb?: string;

  // Reply & Reactions
  replyTo?: Message;
  reactions?: { emoji: string; users: string[] }[] | any[];
  isPinned?: boolean;
  isRecalled?: boolean;

  // File/Image/Voice
  fileName?: string;
  fileSize?: string;
  fileExt?: string;
  imageUrl?: string;
  voiceUrl?: string;
  duration?: string;
  fdata?: string;
  fType?: number;
  tWidth?: number;
  tHeight?: number;

  // Sticker
  stickerId?: number;
  cateId?: number;
  stickerType?: number;
  stickerUrl?: string;
  stickerSpriteUrl?: string;
  stickerTotalFrames?: number;
  stickerDuration?: number;

  // Others
  checkSum?: string;
  checksumSha?: string;
  undo?: number;
  childnumber?: number;
  action?: string;
  params?: string;
  dName?: string;
  contentJson?: string;
}
