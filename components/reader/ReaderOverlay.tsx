"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ReaderOverlayProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isTwoPageMode: boolean;
}

export function ReaderOverlay({
  currentPage,
  totalPages,
  onPageChange,
  isTwoPageMode,
}: ReaderOverlayProps) {
  return (
    <>
      {/* Side Navigation Arrows */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-y-0 left-0 w-24 flex items-center justify-center z-30 group pointer-events-none"
        >
          <button
            onClick={() => onPageChange(Math.max(currentPage - (isTwoPageMode ? 2 : 1), 1))}
            disabled={currentPage <= 1}
            className="h-14 w-14 rounded-full bg-surface-container/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-container hover:scale-110 border border-outline-variant/10 shadow-lg flex items-center justify-center text-primary disabled:opacity-0 pointer-events-auto"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_left</span>
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-y-0 right-0 w-24 flex items-center justify-center z-30 group pointer-events-none"
        >
          <button
            onClick={() => onPageChange(Math.min(currentPage + (isTwoPageMode ? 2 : 1), totalPages))}
            disabled={currentPage >= totalPages}
            className="h-14 w-14 rounded-full bg-surface-container/30 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-container hover:scale-110 border border-outline-variant/10 shadow-lg flex items-center justify-center text-primary disabled:opacity-0 pointer-events-auto"
          >
            <span className="material-symbols-outlined text-[32px]">chevron_right</span>
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Bottom Controls - Just Progress */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 transition-all duration-300 group/controls"
      >
        <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-xl px-6 py-2 rounded-full shadow-lg border border-outline-variant/20">
          <div className="flex flex-col items-center justify-center min-w-[120px] gap-1">
            <span className="text-label-caps text-secondary">Progress</span>
            <span className="text-body-sm font-bold text-on-surface">
              {isTwoPageMode ? (
                <>
                  Page {currentPage}-{Math.min(currentPage + 1, totalPages)} <span className="text-on-surface-variant/50 font-medium">/ {totalPages}</span>
                </>
              ) : (
                <>
                  Page {currentPage} <span className="text-on-surface-variant/50 font-medium">/ {totalPages}</span>
                </>
              )}
            </span>
          </div>
        </div>
        
        {/* Progress Slider */}
        <div className="w-72 sm:w-96 group/slider relative py-2 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-secondary/5 blur-xl rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity" />
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value))}
            className="w-full h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary hover:h-1.5 transition-all relative z-10"
          />
        </div>
      </motion.div>
    </>
  );
}
