export class JoinRoomDto {
  roomId: string;
}

export class LeaveRoomDto {
  roomId: string;
}

export class SendMessageDto {
  roomId: string;
  message: {
    id?: string;
    content: string;
    type?: "text" | "image" | "file" | "audio" | "video";
    replyTo?: string;
    attachments?: any[];
  };
}

export class TypingDto {
  roomId: string;
  isTyping: boolean;
}

export class ReadMessagesDto {
  roomId: string;
  messageIds: string[];
}

export class UserConnectionDto {
  userId: string;
  socketId: string;
}

export class AccountConnectionDto {
  accountId: number;
  userId: string;
  socketId: string;
}

export class MessageDataDto {
  msgId: string;
  isSelf: number;
  content: string;
  messageStatus: "sent" | "failed";
  time: Date;
  type: number;
  threadId: string;
  actionId: string;
  cliMsgId: string;
  uidFrom: string;
  idTo: string;
  dName: string;
  ts: string;
  status: number;
  title?: string;
  description?: string;
  href?: string;
  thumb?: string;
  childnumber?: number;
  action?: string;
  params?: string;
  conversationId: number;
  senderId?: number;
  isRead: number;
  msgType?: string;
  cmd?: number;
  st?: number;
  at?: number;
  createdAt: Date;
  updatedAt: Date;
  reactions?: any[];
}

export class SocketResponseDto {
  event: string;
  data?: any;
  error?: string;
  timestamp: string;
}

export class AccountStatusDto {
  accountId: number;
  userId: string;
  status: "connected" | "disconnected" | "error";
  reason?: string;
  error?: string;
  timestamp: string;
}

export class ReactionDataDto {
  messageId: number;
  conversationId: number;
  action: "add" | "remove";
}
