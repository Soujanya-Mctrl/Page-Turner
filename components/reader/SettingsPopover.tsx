"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Moon, Coffee, ZoomIn, ZoomOut, 
  Maximize2, Minimize2, Bookmark, BookmarkCheck,
  RotateCcw, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReaderTheme } from "@/hooks/useReader";

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  zoom: number;
  onZoomChange: (delta: number) => void;
  isBookmarked: boolean;
  onAddBookmark: () => void;
}

export function SettingsPopover({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  zoom,
  onZoomChange,
  isBookmarked,
  onAddBookmark,
}: SettingsPopoverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible backdrop to close */}
          <div className="fixed inset-0 z-[60]" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-24 right-4 sm:right-1/2 sm:translate-x-[180px] w-72 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[70] overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Reader Settings</h3>

              {/* Theme Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Monitor className="h-3 w-3" /> Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <ThemeOption 
                    active={theme === "light"} 
                    onClick={() => onThemeChange("light")}
                    icon={<Sun className="h-4 w-4" />}
                    label="Light"
                    color="bg-white"
                  />
                  <ThemeOption 
                    active={theme === "dark"} 
                    onClick={() => onThemeChange("dark")}
                    icon={<Moon className="h-4 w-4" />}
                    label="Dark"
                    color="bg-gray-900"
                  />
                  <ThemeOption 
                    active={theme === "sepia"} 
                    onClick={() => onThemeChange("sepia")}
                    icon={<Coffee className="h-4 w-4" />}
                    label="Sepia"
                    color="bg-[#f4ecd8]"
                  />
                </div>
              </div>

              {/* Zoom Section */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Maximize2 className="h-3 w-3" /> Zoom & Layout
                </label>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-white rounded-xl shadow-sm transition-all"
                    onClick={() => onZoomChange(-0.1)}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm font-bold text-gray-900">{Math.round(zoom * 100)}%</span>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 hover:bg-white rounded-xl shadow-sm transition-all"
                    onClick={() => onZoomChange(0.1)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions Section */}
              <div className="pt-2">
                <Button
                  onClick={() => {
                    onAddBookmark();
                    onClose();
                  }}
                  className={`w-full py-6 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold ${
                    isBookmarked 
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-100" 
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
                  }`}
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheck className="h-5 w-5" />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5" />
                      Bookmark Page
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-gray-50/50 p-4 border-t border-gray-100 flex justify-center">
              <button 
                onClick={() => onZoomChange(1.0 - zoom)}
                className="text-[10px] font-bold text-gray-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3" /> Reset to default
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThemeOption({ active, onClick, icon, label, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
        active 
          ? "bg-white border-indigo-200 shadow-md ring-2 ring-indigo-50" 
          : "bg-transparent border-transparent hover:bg-white/50"
      }`}
    >
      <div className={`h-8 w-full rounded-lg ${color} border border-gray-200 shadow-inner flex items-center justify-center`}>
        <div className={active ? "text-indigo-600" : "text-gray-400"}>
          {icon}
        </div>
      </div>
      <span className={`text-[10px] font-bold ${active ? "text-indigo-600" : "text-gray-400"}`}>{label}</span>
    </button>
  );
}
