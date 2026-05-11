"use client";

import { BookCard } from "./BookCard";
import { getBooksAction, batchDeleteBooksAction, updateBookCategoryAction } from "@/lib/actions/book";
import { getCategoriesAction } from "@/lib/actions/category";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CategorySidebar } from "./CategorySidebar";
import { Button, cn } from "@/components/ui/button";
import { toast } from "sonner";

const UploadButton = dynamic(
  () => import("./UploadButton").then((mod) => mod.UploadButton),
  { ssr: false }
);

interface Book {
  id: string;
  title: string;
  coverUrl: string | null;
  currentPage: number;
  totalPages: number | null;
  isEncrypted: number;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface UploadingFile {
  name: string;
  status: string;
  progress: number;
}

export function LibraryGrid() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  
  // Management State
  const [isManageMode, setIsManageMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      setIsSidebarCollapsed(saved === "true");
    }
  }, []);

  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", String(newState));
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log("[LibraryGrid] Fetching books...");
      const [booksData, categoriesData] = await Promise.all([
        getBooksAction(selectedCategoryId || undefined),
        getCategoriesAction(),
      ]);
      console.log(`[LibraryGrid] Received ${booksData.length} books`);
      setBooks(booksData as Book[]);
      setCategories(categoriesData);
    } catch (error) {
      console.error("[LibraryGrid] Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategoryId]);

  const toggleBookSelection = (id: string) => {
    const next = new Set(selectedBookIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBookIds(next);
  };

  const handleBatchDelete = async () => {
    if (selectedBookIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedBookIds.size} books?`)) return;

    try {
      const result = await batchDeleteBooksAction(Array.from(selectedBookIds));
      if (result.success) {
        setSelectedBookIds(new Set());
        setIsManageMode(false);
        toast.success(`Successfully deleted ${selectedBookIds.size} books`);
        fetchData();
      }
    } catch (error) {
      console.error("Batch delete failed:", error);
    }
  };

  const handleBatchCategoryUpdate = async (categoryId: string | null) => {
    if (selectedBookIds.size === 0) return;

    try {
      const result = await updateBookCategoryAction(Array.from(selectedBookIds), categoryId);
      if (result.success) {
        setSelectedBookIds(new Set());
        setIsManageMode(false);
        toast.success(`Updated category for ${selectedBookIds.size} books`);
        fetchData();
      }
    } catch (error) {
      console.error("Batch category update failed:", error);
    }
  };

  const filteredBooks = books.filter((book: Book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "Unread") return matchesSearch && book.currentPage === 0;
    if (activeFilter === "Recent") return matchesSearch; // Sort by date later
    // Add Offline filter logic when IDB integration is ready for filtering
    
    return matchesSearch;
  });

  const handleUploadStart = (files: File[]) => {
    setUploadingFiles(files.map(f => ({ name: f.name, status: "Starting...", progress: 0 })));
  };

  const handleUploadProgress = (fileName: string, status: string, progress: number) => {
    setUploadingFiles(prev => prev.map(f => 
      f.name === fileName ? { ...f, status, progress } : f
    ));
  };

  const handleUploadComplete = () => {
    setUploadingFiles([]);
    fetchData();
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <CategorySidebar 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onCategoryCreated={fetchData}
        onCategoryDeleted={fetchData}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleToggleSidebar}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TopNavBar (Premium) */}
        <header className="bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-50">
          <div className="flex justify-between items-center w-full px-margin-desktop py-4 max-w-max-content mx-auto">
            <div className="flex items-center gap-8">
              <div className="font-display text-headline-lg-mobile tracking-tight text-primary lg:hidden">
                PageTurner
              </div>
              <nav className="hidden md:flex gap-6">
                <button 
                  className="text-secondary font-bold border-b-2 border-secondary text-title-md py-1"
                >
                  Library
                </button>
              </nav>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="relative hidden lg:block group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant group-focus-within:text-secondary transition-colors">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search library..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-b border-outline-variant focus:border-secondary focus:ring-0 focus:outline-none pl-10 pr-4 py-1 text-body-sm w-64 transition-all placeholder:text-on-surface-variant/50"
                />
              </div>

              {/* Privacy Status */}
              <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container px-3 py-1 rounded-full text-label-caps">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  check_circle
                </span>
                Local Only
              </div>

              {/* Management Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsManageMode(!isManageMode);
                  setSelectedBookIds(new Set());
                }}
                className={cn(
                  "rounded-full transition-all",
                  isManageMode ? "bg-primary text-white" : "text-on-surface hover:text-secondary"
                )}
              >
                {isManageMode ? (
                  <span className="material-symbols-outlined text-[24px]">close</span>
                ) : (
                  <span className="material-symbols-outlined text-[24px]">tune</span>
                )}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-margin-mobile md:px-margin-desktop py-8 mb-24 md:mb-8 max-w-max-content mx-auto w-full">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-headline-lg text-primary mb-2">My Library</h1>
              <p className="text-body-sm text-on-surface-variant">
                {books.length} Documents • Last synced just now
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Recent", "Unread", "Offline"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-label-caps transition-all",
                    activeFilter === filter 
                      ? "bg-secondary text-on-secondary shadow-sm" 
                      : "border border-outline-variant text-on-surface bg-surface-bright hover:bg-surface-container"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3 animate-pulse">
                  <div className="aspect-[2/3] w-full rounded-lg bg-surface-container-low" />
                  <div className="h-4 w-3/4 rounded bg-surface-container" />
                  <div className="h-3 w-1/2 rounded bg-surface-container" />
                </div>
              ))}
            </div>
          ) : filteredBooks.length === 0 && uploadingFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="mb-6 text-7xl opacity-50 grayscale">{searchQuery ? "🔍" : "📚"}</div>
              <h2 className="text-headline-lg text-primary">
                {searchQuery ? "No matches found" : "Your shelf is empty"}
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-sm mt-3 leading-relaxed">
                {searchQuery 
                  ? `We couldn't find any books matching "${searchQuery}"`
                  : "Upload your first PDF to start your premium reading experience."}
              </p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-2 gap-gutter sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              <AnimatePresence mode="popLayout">
                {uploadingFiles.map((file) => (
                  <motion.div
                    key={`upload-${file.name}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <div className="relative aspect-[2/3] rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center p-4 overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-surface-container/50">
                        <div 
                          className="h-full bg-secondary transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <span className="material-symbols-outlined text-[32px] text-secondary animate-spin mb-3">
                        progress_activity
                      </span>
                      <p className="text-label-caps text-on-surface-variant text-center truncate w-full">
                        {file.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {filteredBooks.map((book: Book) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <BookCard
                      id={book.id}
                      title={book.title}
                      coverUrl={book.coverUrl}
                      progress={Math.round((book.currentPage / (book.totalPages || 1)) * 100)}
                      isEncrypted={book.isEncrypted === 1}
                      isManageMode={isManageMode}
                      isSelected={selectedBookIds.has(book.id)}
                      onToggleSelection={toggleBookSelection}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Batch Action Bar */}
        <AnimatePresence>
          {isManageMode && selectedBookIds.size > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-inverse-surface text-inverse-on-surface px-6 py-4 rounded-full shadow-2xl flex items-center gap-8 border border-outline/20 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 pr-6 border-r border-outline-variant/30">
                <div className="h-8 w-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-sm font-bold">
                  {selectedBookIds.size}
                </div>
                <span className="text-label-caps">Selected</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group/category">
                  <Button
                    variant="ghost"
                    className="gap-2 text-inverse-on-surface hover:bg-white/10 rounded-full"
                  >
                    <span className="material-symbols-outlined text-[20px]">drive_file_move</span>
                    <span className="text-sm">Move to</span>
                  </Button>
                  
                  <div className="absolute bottom-full mb-2 left-0 w-48 bg-inverse-surface rounded-2xl shadow-xl border border-outline/20 py-2 hidden group-hover/category:block">
                    <button
                      onClick={() => handleBatchCategoryUpdate(null)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                    >
                      None (Untagged)
                    </button>
                    {categories.map((category: Category) => (
                      <button
                        key={category.id}
                        onClick={() => handleBatchCategoryUpdate(category.id)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleBatchDelete}
                  variant="ghost"
                  className="gap-2 text-error-container hover:text-error hover:bg-error/10 rounded-full"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                  <span className="text-sm font-semibold">Delete</span>
                </Button>
              </div>

              <button
                onClick={() => setSelectedBookIds(new Set())}
                className="ml-2 p-2 rounded-full hover:bg-white/10 text-outline-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">check_circle</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed FAB for upload */}
        <div className="fixed bottom-10 right-10 z-[90] group">
          <div className="absolute -inset-4 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-all opacity-0 group-hover:opacity-100" />
          <UploadButton 
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </main>
    </div>
  );
}
