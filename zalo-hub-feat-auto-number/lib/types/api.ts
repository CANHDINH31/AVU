import { Conversation } from "./conversation";
import { Friend } from "./friend";
import { FriendRequest } from "./friend-request";
import { SentFriendRequest } from "./sent-friend-request";

export interface FriendsListResponse {
  data: Friend[];
  total: number;
}

export interface ConversationsListResponse {
  data: Conversation[];
  total: number;
}

export interface FriendRequestsListResponse {
  data: FriendRequest[];
  total: number;
}

export interface SentFriendRequestsListResponse {
  data: SentFriendRequest[];
  total: number;
}
