import { Outfit } from "next/font/google";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AlertProvider } from '@/context/AlertContext';

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css"; // If using BlockNote elsewhere
import "@liveblocks/react-ui/styles.css"; // Core Liveblocks UI styles
import "@liveblocks/react-ui/styles/dark/media-query.css";
import "@liveblocks/react-tiptap/styles.css"; // Base styles for TipTap collab
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
        <ThemeProvider>
            <SidebarProvider>
          <AlertProvider>
              {children}
          </AlertProvider>
              </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
