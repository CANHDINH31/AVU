export interface SentFriendRequest {
  id: number;
  userId: string;
  zaloName?: string;
  displayName?: string;
  avatar?: string;
  globalId?: string;
  bizPkg?: any;
  fReqInfo: string;
  accountId: number;
  account: {
    displayName: string;
    zaloName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
