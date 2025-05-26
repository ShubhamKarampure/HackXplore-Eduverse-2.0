import { Outfit } from "next/font/google";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AlertProvider } from '@/context/AlertContext';

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
