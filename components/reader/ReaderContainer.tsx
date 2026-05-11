"use client";

import { useReader } from "@/hooks/useReader";
import { PdfRenderer } from "./PdfRenderer";
import { ReaderHeader } from "./ReaderHeader";
import { ReaderOverlay } from "./ReaderOverlay";
import { ReaderSidebar } from "./ReaderSidebar";
import { SettingsPopover } from "./SettingsPopover";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface ReaderContainerProps {
  book: {
    id: string;
    title: string;
    isEncrypted: boolean;
    encryptionKey?: string;
    totalPages: number;
    currentPage: number;
    signedUrl: string;
  };
}

export function ReaderContainer({ book }: ReaderContainerProps) {
  const {
    pdfDocument,
    isLoading,
    error,
    currentPage,
    theme,
    zoom,
    outline,
    bookmarks,
    goToPage,
    changeTheme,
    changeZoom,
    addBookmark,
    removeBookmark,
    isTwoPageMode,
    toggleTwoPageMode,
  } = useReader({
    bookId: book.id,
    signedUrl: book.signedUrl,
    isEncrypted: book.isEncrypted,
    encryptionKey: book.encryptionKey,
    initialPage: book.currentPage,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false);
  const flipBookRef = useRef<any>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "arrowright":
          const nextStep = isTwoPageMode && currentPage > 1 ? 2 : 1;
          goToPage(Math.min(currentPage + nextStep, book.totalPages));
          break;
        case "arrowleft":
          const prevStep = isTwoPageMode && currentPage > 2 ? 2 : 1;
          goToPage(Math.max(currentPage - prevStep, 1));
          break;
        case "s":
          setIsSidebarOpen(prev => !prev);
          break;
        case "t":
          toggleTwoPageMode();
          break;
        case "m":
          const isBookmarked = bookmarks.some(b => b.pageNumber === currentPage);
          if (isBookmarked) {
            const bookmark = bookmarks.find(b => b.pageNumber === currentPage);
            if (bookmark) removeBookmark(bookmark.id);
          } else {
            addBookmark();
          }
          break;
        case "f":
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
          } else {
            document.exitFullscreen();
          }
          break;
        case "escape":
          if (isSidebarOpen) {
            setIsSidebarOpen(false);
          } else if (isSettingsOpen) {
            setIsSettingsOpen(false);
          } else {
            setIsUIHidden(true); // Esc hides the UI for distraction-free reading
          }
          break;
        case "+":
        case "=":
          changeZoom(0.1);
          break;
        case "-":
        case "_":
          changeZoom(-0.1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, book.totalPages, isTwoPageMode, goToPage, bookmarks, addBookmark, removeBookmark, toggleTwoPageMode, changeZoom, isSidebarOpen, isSettingsOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-container-lowest">
        <span className="material-symbols-outlined text-[48px] animate-spin text-primary mb-4">progress_activity</span>
        <p className="text-on-surface-variant font-medium animate-pulse">Decrypting & Loading your library...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-container-lowest p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-error-container/10 flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-[32px] text-error">error</span>
        </div>
        <h2 className="text-title-lg font-display text-primary mb-2">Failed to load manuscript</h2>
        <p className="text-body-md text-on-surface-variant max-w-sm mb-8 leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!pdfDocument) return null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface select-none relative">
      <ReaderHeader 
        title={book.title} 
        theme={theme} 
        setTheme={changeTheme} 
        onOpenSidebar={() => setIsSidebarOpen(prev => !prev)}
        zoom={zoom}
        onZoomChange={changeZoom}
        isTwoPageMode={isTwoPageMode}
        onToggleTwoPageMode={toggleTwoPageMode}
        isBookmarked={bookmarks.some(b => b.pageNumber === currentPage)}
        onAddBookmark={addBookmark}
        onHideUI={() => setIsUIHidden(true)}
        isSidebarOpen={isSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsPopover
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        onThemeChange={changeTheme}
        zoom={zoom}
        onZoomChange={changeZoom}
        isTwoPageMode={isTwoPageMode}
        onTwoPageModeToggle={toggleTwoPageMode}
      />

      <div className="flex flex-grow relative overflow-hidden">
        <ReaderSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          outline={outline}
          bookmarks={bookmarks}
          onPageJump={goToPage}
          onRemoveBookmark={removeBookmark}
          currentPage={currentPage}
        />
        
        <main 
          className={`flex-grow flex flex-col items-center overflow-y-auto relative transition-all duration-500 bg-surface-container-lowest`}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high z-10">
            <div 
              className="h-full bg-secondary transition-all duration-300" 
              style={{ width: `${(currentPage / (pdfDocument?.numPages || 1)) * 100}%` }}
            />
          </div>

          <div className="w-full h-full flex items-center justify-center p-4 md:p-8 lg:p-12">
            <PdfRenderer
              pdfDocument={pdfDocument}
              pageNumber={currentPage}
              zoom={zoom}
              theme={theme}
              isTwoPageMode={isTwoPageMode}
              onPageFlip={goToPage}
              flipBookRef={flipBookRef}
            />
          </div>

          <AnimatePresence>
            {!isUIHidden && (
              <ReaderOverlay
                currentPage={currentPage}
                totalPages={pdfDocument.numPages}
                onPageChange={goToPage}
                isTwoPageMode={isTwoPageMode}
              />
            )}
          </AnimatePresence>

          {isUIHidden && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed bottom-6 right-6 z-50"
            >
              <button
                onClick={() => setIsUIHidden(false)}
                className="h-12 w-12 rounded-full bg-surface-container-highest/80 backdrop-blur-md border border-outline-variant/20 shadow-lg flex items-center justify-center text-primary hover:bg-surface-container-highest transition-all"
                title="Show UI"
              >
                <span className="material-symbols-outlined text-[24px]">visibility</span>
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

