"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PdfOutlineItem } from "@/hooks/useReader";
import { Button } from "@/components/ui/button";

interface ReaderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  outline: PdfOutlineItem[];
  bookmarks: any[];
  onPageJump: (page: number) => void;
  onRemoveBookmark: (id: string) => void;
  currentPage: number;
}

export function ReaderSidebar({
  isOpen,
  onClose,
  outline,
  bookmarks,
  onPageJump,
  onRemoveBookmark,
  currentPage,
}: ReaderSidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: isOpen ? 280 : 0,
          x: isOpen ? 0 : -20,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`bg-surface border-r border-outline-variant/20 flex flex-col flex-shrink-0 h-full overflow-hidden z-50 
          ${isOpen ? "fixed inset-y-0 left-0 shadow-2xl md:shadow-none md:sticky top-0" : "absolute md:sticky top-0"}`}
      >
      <div className="w-[280px] h-full flex flex-col overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <h2 className="text-title-md text-primary mb-6">Contents</h2>
          
          <nav className="flex flex-col gap-1">
            {outline.length > 0 ? (
              outline.map((item, idx) => (
                <OutlineItem 
                  key={idx} 
                  item={item} 
                  onJump={onPageJump} 
                  currentPage={currentPage}
                />
              ))
            ) : (
              <p className="text-body-sm text-on-surface-variant/50 italic py-4">
                No table of contents found.
              </p>
            )}
          </nav>

          <div className="mt-12 pt-6 border-t border-outline-variant/20">
            <h3 className="text-label-caps text-on-surface-variant mb-4 tracking-wider">
              Bookmarks
            </h3>
            
            <div className="flex flex-col gap-3">
              {bookmarks.length > 0 ? (
                bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    onJump={onPageJump}
                    onRemove={onRemoveBookmark}
                    isCurrent={currentPage === bookmark.pageNumber}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-[32px] text-surface-variant mb-2">
                    bookmark
                  </span>
                  <p className="text-body-sm text-on-surface-variant/50">
                    No bookmarks yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
    </>
  );
}


function OutlineItem({ item, onJump, currentPage, level = 0 }: { item: PdfOutlineItem; onJump: (p: number) => void; currentPage: number; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.items && item.items.length > 0;
  const isActive = item.pageNumber === currentPage;

  return (
    <div className="flex flex-col">
      <div 
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
          isActive 
            ? "bg-secondary-container/10 text-secondary font-bold border-l-2 border-secondary" 
            : "text-on-surface-variant hover:bg-surface-container-highest"
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
        onClick={() => item.pageNumber && onJump(item.pageNumber)}
      >
        <span className="truncate flex-1 font-body-sm text-body-sm">
          {item.title}
        </span>
        
        {item.pageNumber && (
          <span className={`font-body-sm text-body-sm ${isActive ? "text-secondary/70" : "text-on-surface-variant/50 group-hover:text-on-surface-variant"}`}>
            {item.pageNumber}
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {item.items.map((child, idx) => (
            <OutlineItem 
              key={idx} 
              item={child} 
              onJump={onJump} 
              currentPage={currentPage}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookmarkCard({ bookmark, onJump, onRemove, isCurrent }: { bookmark: any; onJump: (p: number) => void; onRemove: (id: string) => void; isCurrent: boolean }) {
  return (
    <div 
      className={`bg-surface-container-low p-3 rounded-lg border transition-all cursor-pointer group ${
        isCurrent ? "border-secondary" : "border-surface-variant hover:border-outline-variant"
      }`}
      onClick={() => onJump(bookmark.pageNumber)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-label-caps">
          Note
        </span>
        <div className="flex items-center gap-2">
          <span className="text-on-surface-variant/70 text-[10px] font-label-caps">
            Pg {bookmark.pageNumber}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(bookmark.id);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error-container hover:text-error rounded transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        </div>
      </div>
      <p className="text-body-sm text-on-surface line-clamp-2">
        {bookmark.label || `Bookmark at page ${bookmark.pageNumber}`}
      </p>
    </div>
  );
}
