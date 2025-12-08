import { Friend } from "./friend";
import { Message } from "./message";
import { Reaction } from "./reaction";

export interface Conversation {
  id: number;
  account_id: number;
  friend_id: number;
  userZaloId: string;
  userKey: string;
  isPinned?: number;
  friend: Friend;
  messages: Message[];
  unreadCount?: number;
  createdAt?: string;
  updatedAt?: string;
  account: {
    displayName: string;
    username: string;
  };
  latestUnreadReaction: Reaction;
}
