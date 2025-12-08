"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface ChatContextType {
  selectedAccounts: string[];
  setSelectedAccounts: (accounts: string[]) => void;
  clearSelectedAccounts: () => void;
  isInitialized: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = "zalo-selected-accounts";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Khôi phục selectedAccounts từ localStorage khi component mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedAccounts(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Error loading selected accounts from localStorage:",
        error
      );
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Lưu selectedAccounts vào localStorage mỗi khi có thay đổi
  const updateSelectedAccounts = (accounts: string[]) => {
    setSelectedAccounts(accounts);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error("Error saving selected accounts to localStorage:", error);
    }
  };

  const clearSelectedAccounts = () => {
    setSelectedAccounts([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error(
        "Error clearing selected accounts from localStorage:",
        error
      );
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedAccounts,
        setSelectedAccounts: updateSelectedAccounts,
        clearSelectedAccounts,
        isInitialized,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
