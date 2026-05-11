"use client";

import { ReaderTheme } from "@/hooks/useReader";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ReaderHeaderProps {
  title: string;
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  onOpenSidebar: () => void;
  zoom?: number;
  onZoomChange?: (delta: number) => void;
  isTwoPageMode?: boolean;
  onToggleTwoPageMode?: () => void;
  isBookmarked?: boolean;
  onAddBookmark?: () => void;
  onHideUI?: () => void;
  isSidebarOpen?: boolean;
  onOpenSettings?: () => void;
}

export function ReaderHeader({ 
  title, 
  theme, 
  setTheme, 
  onOpenSidebar,
  zoom = 1,
  onZoomChange,
  isTwoPageMode,
  onToggleTwoPageMode,
  isBookmarked,
  onAddBookmark,
  onHideUI,
  isSidebarOpen,
  onOpenSettings
}: ReaderHeaderProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <header className="bg-surface-bright/80 backdrop-blur-lg shadow-sm flex justify-between items-center w-full px-4 py-2 z-40 sticky top-0 border-b border-outline-variant/10 text-primary">
      <div className="flex items-center gap-4">
        <button 
          aria-label="Go back" 
          onClick={() => router.push("/")}
          className="p-2 text-primary hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center group"
        >
          <span className="material-symbols-outlined text-[24px] group-active:scale-90 transition-transform">arrow_back</span>
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            aria-label="Toggle Sidebar" 
            onClick={onOpenSidebar}
            className={`p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center ${isSidebarOpen ? "bg-surface-container-highest/30" : ""}`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSidebarOpen ? "menu_open" : "menu"}
            </span>
          </button>
          <h1 className="font-display text-title-md text-primary font-bold hidden sm:block truncate max-w-[300px] lg:max-w-md">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Zoom Controls */}
        {onZoomChange && (
          <div className="hidden lg:flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant border border-surface-variant">
            <span className="font-body text-body-sm mr-2">Zoom:</span>
            <button 
              aria-label="Zoom Out" 
              onClick={() => onZoomChange(-0.1)}
              className="p-1 hover:bg-surface-container-highest rounded-full transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="font-body text-label-caps px-2 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              aria-label="Zoom In" 
              onClick={() => onZoomChange(0.1)}
              className="p-1 hover:bg-surface-container-highest rounded-full transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        )}

        <div className="h-6 w-px bg-outline-variant/30 hidden md:block mx-1"></div>

        {/* Action Buttons */}
        <button 
          aria-label="Toggle Brightness" 
          onClick={onHideUI}
          className="p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[24px]">visibility_off</span>
        </button>

        <button 
          aria-label="Layout Mode" 
          onClick={onToggleTwoPageMode}
          className={`p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center ${isTwoPageMode ? "text-secondary" : ""}`}
        >
          <span className="material-symbols-outlined text-[24px]">{isTwoPageMode ? "auto_stories" : "menu_book"}</span>
        </button>

        <button 
          aria-label="Theme Palette" 
          onClick={onOpenSettings}
          className="p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[24px]">palette</span>
        </button>

        <div className="flex items-center gap-2 ml-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-surface-variant hidden md:flex">
          <span className="material-symbols-outlined text-[16px] text-secondary">cloud_done</span>
          <span className="font-body text-label-caps text-on-surface-variant">Saved</span>
        </div>

        <button 
          aria-label="Bookmark" 
          onClick={onAddBookmark}
          className={`p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center ml-1 ${isBookmarked ? "text-secondary" : ""}`}
        >
          <span className={`material-symbols-outlined text-[24px] ${isBookmarked ? "fill-[1]" : ""}`}>
            {isBookmarked ? "bookmark_added" : "bookmark_add"}
          </span>
        </button>

        <button 
          aria-label="Fullscreen" 
          onClick={toggleFullscreen}
          className="p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isFullscreen ? "fullscreen_exit" : "fullscreen"}
          </span>
        </button>

        <button aria-label="More Options" className="p-2 text-on-surface-variant hover:bg-surface-container-highest/50 rounded-full transition-all flex items-center justify-center ml-1">
          <span className="material-symbols-outlined text-[24px]">more_vert</span>
        </button>
      </div>
    </header>
  );
}

