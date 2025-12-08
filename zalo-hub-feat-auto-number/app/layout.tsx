import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { ChatProvider } from "@/lib/contexts/chat-context";
import { SocketProvider } from "@/lib/contexts/socket-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DNH Zalo",
  description: "Manage multiple Zalo accounts efficiently",
  icons: {
    icon: "/dnh.png",
    shortcut: "/dnh.png",
    apple: "/dnh.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          <QueryProvider>
            <ChatProvider>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>
            </ChatProvider>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
