import GridShape from "@/components/courses/dashboard/stats/common/GridShape";
import ThemeTogglerTwo from "@/components/courses/dashboard/stats/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({children}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
          {children}
          
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
       </ThemeProvider>
    </div>
  );
}
