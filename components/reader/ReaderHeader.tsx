"use client";

import { ChevronLeft, Sun, Moon, Coffee, Maximize2, Minimize2, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReaderTheme } from "@/hooks/useReader";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

interface ReaderHeaderProps {
  title: string;
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  onOpenSidebar: () => void;
}

export function ReaderHeader({ title, theme, setTheme, onOpenSidebar }: ReaderHeaderProps) {
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
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-4 right-4 z-50 bg-white/70 backdrop-blur-xl border border-white/40 px-4 py-2 flex items-center justify-between rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] opacity-0 hover:opacity-100 focus-within:opacity-100 transition-all duration-300 group/header"
    >
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onOpenSidebar}
          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="w-px h-4 bg-gray-200" />

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-sm font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-md tracking-tight">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex bg-gray-100/50 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50">
          <ThemeButton active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun className="h-4 w-4" />} />
          <ThemeButton active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon className="h-4 w-4" />} />
          <ThemeButton active={theme === "sepia"} onClick={() => setTheme("sepia")} icon={<Coffee className="h-4 w-4" />} />
        </div>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </motion.header>
  );
}

function ThemeButton({ active, onClick, icon }: { active: boolean; onClick: () => void; icon: React.ReactNode }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 rounded-lg transition-all duration-200 ${
        active 
          ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5" 
          : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
      }`}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}
