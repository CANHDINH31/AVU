export interface Reaction {
  id: number;
  actionId: string;
  msgId: string;
  messageId: number;
  cliMsgId: string;
  msgType?: string;
  uidFrom: string;
  idTo: string;
  ts: string;
  rIcon: string;
  msgSender: string;
  rType: number;
  source?: number;
  ttl?: number;
  threadId: string;
  isSelf: number;
  rMsg?: any[];
  gMsgID?: string;
  cMsgID?: string;
  dName?: string;
  isRead: number;
  conversationId: number;
  createdAt: string;
  updatedAt: string;
}
