"use client";

import { ChevronLeft, Sun, Moon, Coffee, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReaderTheme } from "@/hooks/useReader";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ReaderHeaderProps {
  title: string;
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
}

export function ReaderHeader({ title, theme, setTheme }: ReaderHeaderProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center justify-between shadow-sm opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4" />
          </Button>
          <Button
            variant={theme === "sepia" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setTheme("sepia")}
          >
            <Coffee className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
