"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReaderTheme } from "@/hooks/useReader";

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ReaderTheme;
  onThemeChange: (theme: ReaderTheme) => void;
  zoom: number;
  onZoomChange: (delta: number) => void;
  isTwoPageMode: boolean;
  onTwoPageModeToggle: () => void;
}

export function SettingsPopover({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  zoom,
  onZoomChange,
  isTwoPageMode,
  onTwoPageModeToggle,
}: SettingsPopoverProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-50 pointer-events-auto" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
            className="fixed top-16 right-4 w-72 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/30 rounded-3xl shadow-2xl z-[60] overflow-hidden"
          >
            <div className="p-5 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-title-sm text-primary font-bold">Reader Settings</h3>
                <button 
                  onClick={onClose}
                  className="p-1.5 hover:bg-surface-container-highest rounded-full transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Theme Section */}
              <div className="space-y-3">
                <label className="text-label-caps text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">palette</span> Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <ThemeOption 
                    active={theme === "light"} 
                    onClick={() => onThemeChange("light")}
                    label="Light"
                    color="bg-[#FFFFFF]"
                  />
                  <ThemeOption 
                    active={theme === "dark"} 
                    onClick={() => onThemeChange("dark")}
                    label="Dark"
                    color="bg-[#1A1C1E]"
                  />
                  <ThemeOption 
                    active={theme === "sepia"} 
                    onClick={() => onThemeChange("sepia")}
                    label="Sepia"
                    color="bg-[#F4ECD8]"
                  />
                </div>
              </div>

              {/* Layout Mode */}
              <div className="space-y-3">
                <label className="text-label-caps text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">auto_stories</span> Page Layout
                </label>
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-1 rounded-2xl border border-outline-variant/20">
                  <button
                    onClick={() => isTwoPageMode && onTwoPageModeToggle()}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                      !isTwoPageMode 
                        ? "bg-secondary-container text-on-secondary-container shadow-sm font-bold" 
                        : "text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">article</span>
                    <span className="text-body-sm">Single</span>
                  </button>
                  <button
                    onClick={() => !isTwoPageMode && onTwoPageModeToggle()}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                      isTwoPageMode 
                        ? "bg-secondary-container text-on-secondary-container shadow-sm font-bold" 
                        : "text-on-surface-variant hover:bg-surface-container-highest"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                    <span className="text-body-sm">Spread</span>
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="space-y-3">
                <label className="text-label-caps text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">zoom_in</span> Magnification
                </label>
                <div className="flex items-center justify-between bg-surface-container-low p-2 rounded-2xl border border-outline-variant/20">
                  <button
                    onClick={() => onZoomChange(-0.1)}
                    className="h-10 w-10 flex items-center justify-center hover:bg-surface-container-highest rounded-xl transition-all text-primary"
                  >
                    <span className="material-symbols-outlined text-[24px]">remove</span>
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-body-md font-bold text-primary">{Math.round(zoom * 100)}%</span>
                    <button 
                      onClick={() => onZoomChange(1.0 - zoom)}
                      className="text-[10px] text-secondary font-bold uppercase tracking-tighter hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onZoomChange(0.1)}
                    className="h-10 w-10 flex items-center justify-center hover:bg-surface-container-highest rounded-xl transition-all text-primary"
                  >
                    <span className="material-symbols-outlined text-[24px]">add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-highest/30 p-4 border-t border-outline-variant/20 flex justify-center">
              <p className="text-[10px] text-on-surface-variant/50 font-medium text-center leading-tight uppercase tracking-[0.1em]">
                Stitch Reader Engine v1.0<br/>Enhanced for PageTurner
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThemeOption({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all ${
        active 
          ? "bg-surface-container-lowest border-secondary shadow-md ring-4 ring-secondary/5" 
          : "bg-transparent border-transparent hover:bg-surface-container-highest/50"
      }`}
    >
      <div className={`h-10 w-full rounded-xl ${color} border border-outline-variant/20 shadow-inner flex items-center justify-center relative overflow-hidden`}>
        {active && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/10">
            <span className="material-symbols-outlined text-secondary text-[20px] fill-[1]">check_circle</span>
          </div>
        )}
      </div>
      <span className={`text-[11px] font-bold ${active ? "text-secondary" : "text-on-surface-variant"}`}>{label}</span>
    </button>
  );
}

