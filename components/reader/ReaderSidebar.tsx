"use client";

import { useState } from "react";
import { List, Bookmark, X, Trash2, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { PdfOutlineItem } from "@/hooks/useReader";

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
  const [activeTab, setActiveTab] = useState<"contents" | "bookmarks">("contents");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-80 sm:w-96 bg-white/90 backdrop-blur-2xl border-r border-white/40 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Navigation</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-xl hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </Button>
            </div>

            {/* Tabs */}
            <div className="px-6 flex gap-1 mb-4">
              <TabButton
                active={activeTab === "contents"}
                onClick={() => setActiveTab("contents")}
                icon={<List className="h-4 w-4" />}
                label="Contents"
              />
              <TabButton
                active={activeTab === "bookmarks"}
                onClick={() => setActiveTab("bookmarks")}
                icon={<Bookmark className="h-4 w-4" />}
                label="Bookmarks"
              />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
              {activeTab === "contents" ? (
                <div className="space-y-1">
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
                    <div className="py-20 text-center">
                      <p className="text-gray-400 text-sm italic">No table of contents found.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => (
                      <BookmarkItem
                        key={bookmark.id}
                        bookmark={bookmark}
                        onJump={onPageJump}
                        onRemove={onRemoveBookmark}
                        isCurrent={currentPage === bookmark.pageNumber}
                      />
                    ))
                  ) : (
                    <div className="py-20 text-center">
                      <Bookmark className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No bookmarks yet.</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Add them from the reader menu</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
        active 
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
          : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function OutlineItem({ item, onJump, currentPage, level = 0 }: { item: PdfOutlineItem; onJump: (p: number) => void; currentPage: number; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = item.items && item.items.length > 0;
  const isActive = item.pageNumber === currentPage;

  return (
    <div className="flex flex-col">
      <div 
        className={`group flex items-center gap-2 p-2 rounded-xl transition-all cursor-pointer ${
          isActive ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-gray-200/50 rounded-md transition-colors"
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        <span 
          className={`text-sm flex-1 truncate ${isActive ? "font-bold" : "font-medium"}`}
          onClick={() => item.pageNumber && onJump(item.pageNumber)}
        >
          {item.title}
        </span>

        {item.pageNumber && (
          <span className="text-[10px] font-mono opacity-40 group-hover:opacity-100 transition-opacity">
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

function BookmarkItem({ bookmark, onJump, onRemove, isCurrent }: { bookmark: any; onJump: (p: number) => void; onRemove: (id: string) => void; isCurrent: boolean }) {
  return (
    <div 
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
        isCurrent 
          ? "bg-indigo-50/50 border-indigo-200" 
          : "bg-white border-gray-100 hover:border-indigo-200 hover:shadow-md"
      }`}
      onClick={() => onJump(bookmark.pageNumber)}
    >
      <div className="flex flex-col gap-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <Bookmark className={`h-3 w-3 ${isCurrent ? "text-indigo-600 fill-indigo-600" : "text-gray-400"}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? "text-indigo-600" : "text-gray-400"}`}>
            Page {bookmark.pageNumber}
          </span>
        </div>
        <span className={`text-sm truncate ${isCurrent ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
          {bookmark.label}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(bookmark.id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
