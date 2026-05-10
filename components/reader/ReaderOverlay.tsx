"use client";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReaderOverlayProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onZoomChange: (delta: number) => void;
}

export function ReaderOverlay({
  currentPage,
  totalPages,
  onPageChange,
  onZoomChange,
}: ReaderOverlayProps) {
  return (
    <>
      {/* Side Navigation Arrows */}
      <div className="fixed inset-y-0 left-0 w-16 sm:w-24 flex items-center justify-center z-30 group">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="fixed inset-y-0 right-0 w-16 sm:w-24 flex items-center justify-center z-30 group">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(-0.1)}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="h-4 w-px bg-gray-200 mx-1" />
          
          <span className="text-xs font-bold text-gray-600 min-w-[6rem] text-center">
            Page {currentPage} of {totalPages}
          </span>
          
          <div className="h-4 w-px bg-gray-200 mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onZoomChange(0.1)}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Progress Slider */}
        <div className="w-64 sm:w-80 group">
          <input
            type="range"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => onPageChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:h-2 transition-all"
          />
        </div>
      </div>
    </>
  );
}
