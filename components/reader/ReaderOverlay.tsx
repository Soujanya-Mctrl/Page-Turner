"use client";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Settings2, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SettingsPopover } from "./SettingsPopover";
import { ReaderTheme } from "@/hooks/useReader";

interface ReaderOverlayProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onZoomChange: (delta: number) => void;
  onAddBookmark: () => void;
  isBookmarked: boolean;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  zoom: number;
}

export function ReaderOverlay({
  currentPage,
  totalPages,
  onPageChange,
  onZoomChange,
  onAddBookmark,
  isBookmarked,
  theme,
  onThemeChange,
  zoom,
}: ReaderOverlayProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <SettingsPopover
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={onThemeChange}
        zoom={zoom}
        onZoomChange={onZoomChange}
        isBookmarked={isBookmarked}
        onAddBookmark={onAddBookmark}
      />
      {/* Side Navigation Arrows */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-y-0 left-0 w-24 flex items-center justify-center z-30 group"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 border border-white/20 shadow-xl"
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-8 w-8 text-white drop-shadow-md" />
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-y-0 right-0 w-24 flex items-center justify-center z-30 group"
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white/20 hover:scale-110 border border-white/20 shadow-xl"
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-8 w-8 text-white drop-shadow-md" />
          </Button>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Controls */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-6 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-all duration-300 group/controls"
      >
        <div className="flex items-center gap-2 bg-white/70 backdrop-blur-xl px-2 py-2 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/40">
          <div className="flex items-center bg-gray-100/50 rounded-xl p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white rounded-lg transition-colors"
              onClick={() => onZoomChange(-0.1)}
            >
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </Button>
            
            <div className="w-px h-4 bg-gray-300 mx-1" />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white rounded-lg transition-colors"
              onClick={() => onZoomChange(0.1)}
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          
          <div className="px-4 py-1 flex flex-col items-center min-w-[120px]">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5">Progress</span>
            <span className="text-xs font-bold text-gray-900">
              Page {currentPage} <span className="text-gray-400 font-medium">/ {totalPages}</span>
            </span>
          </div>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={onAddBookmark}
            className={`h-10 w-10 rounded-xl transition-all ${
              isBookmarked 
                ? "text-indigo-600 bg-indigo-50" 
                : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="h-5 w-5 fill-indigo-600" /> : <Bookmark className="h-5 w-5" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className={`h-10 w-10 rounded-xl transition-all ${
              isSettingsOpen ? "bg-indigo-50 text-indigo-600" : "hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <Settings2 className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Progress Slider */}
        <div className="w-72 sm:w-96 group/slider relative py-2">
          <div className="absolute inset-0 bg-indigo-500/5 blur-xl rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity" />
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:h-2 transition-all relative z-10"
          />
        </div>
      </motion.div>
    </>
  );
}
