export interface FriendRequest {
  id: number;
  userId: string;
  zaloName?: string;
  phoneNumber?: string;
  recommInfo: string;
  recommSrc: number;
  recommTime: number;
  recommType: number;
  status: string;
  isSeenFriendReq: number;
  gender?: number;
  dob?: number;
  displayName?: string;
  avatar?: string;
  bizPkg?: any;
  type: number;
  accountId: number;
  account: {
    displayName: string;
    zaloName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
