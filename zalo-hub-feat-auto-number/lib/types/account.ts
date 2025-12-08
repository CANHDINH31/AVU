export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Account {
  id: number;
  userZaloId: string;
  accountStatus?: number;
  avatar?: string;
  bgavatar?: string;
  bizPkg?: {
    label: string | null;
    pkgId: number;
  };
  cover?: string;
  createdTs?: number;
  displayName?: string;
  dob?: number;
  gender?: number;
  globalId?: string;
  isActive?: number;
  isActivePC?: number;
  isActiveWeb?: number;
  isBlocked?: number;
  isFr?: number;
  isValid?: number;
  key?: number;
  lastActionTime?: number;
  lastUpdateTime?: number;
  oaInfo?: any;
  oa_status?: any;
  phoneNumber?: string;
  sdob?: string;
  status?: string;
  type?: number;
  userKey?: string;
  user_mode?: number;
  username?: string;
  zaloName?: string;
  autoFriendRequestEnabled?: boolean;
  friendRequestStartTime?: string | null;
  autoMessageEnabled?: boolean;
  bulkMessageContent?: string | null;
  createdAt: Date;
  updatedAt: Date;
  isConnect: number;
  user?: User;
}
