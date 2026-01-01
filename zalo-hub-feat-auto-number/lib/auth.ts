export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  rankId?: number | null;
  rank?: {
    id: number;
    name: string;
    displayName: string;
    maxAccounts: number;
    order: number;
  } | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface VerifyResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export const getUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const setUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem("user");
};
