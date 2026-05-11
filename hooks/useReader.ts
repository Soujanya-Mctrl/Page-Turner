"use client";

import { useState, useEffect, useCallback } from "react";
import { importKey, decryptData, unpackEncryptedBlob } from "@/lib/encryption";
import { updateReadingProgressAction } from "@/lib/actions/reading";
import type * as PdfJS from "pdfjs-dist";

interface UseReaderProps {
  bookId: string;
  signedUrl: string;
  isEncrypted: boolean;
  encryptionKey?: string;
  initialPage?: number;
}

export type ReaderTheme = "light" | "dark" | "sepia";

import { getBookOffline, saveBookOffline } from "@/lib/db/indexeddb";
import { getBookmarksAction, addBookmarkAction, removeBookmarkAction } from "@/lib/actions/bookmarks";

export interface PdfOutlineItem {
  title: string;
  dest: any;
  items: PdfOutlineItem[];
  pageNumber?: number;
}

export function useReader({
  bookId,
  signedUrl,
  isEncrypted,
  encryptionKey,
  initialPage = 1,
}: UseReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pdfDocument, setPdfDocument] = useState<PdfJS.PDFDocumentProxy | null>(null);
  const [outline, setOutline] = useState<PdfOutlineItem[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [zoom, setZoom] = useState(1.0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isTwoPageMode, setIsTwoPageMode] = useState(false);

  // Load persistence from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem(`pageturner-theme`);
    const savedZoom = localStorage.getItem(`pageturner-zoom`);
    const savedLayout = localStorage.getItem(`pageturner-layout`);

    if (savedTheme) setTheme(savedTheme as ReaderTheme);
    if (savedZoom) setZoom(parseFloat(savedZoom));
    if (savedLayout) setIsTwoPageMode(savedLayout === "two-page");
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(`pageturner-theme`, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(`pageturner-zoom`, zoom.toString());
  }, [zoom]);

  useEffect(() => {
    localStorage.setItem(`pageturner-layout`, isTwoPageMode ? "two-page" : "one-page");
  }, [isTwoPageMode]);

  // Load and decrypt PDF
  useEffect(() => {
    async function loadPdf() {
      try {
        setIsLoading(true);
        
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        // 1. Fetch Bookmarks from DB
        const savedBookmarks = await getBookmarksAction(bookId);
        setBookmarks(savedBookmarks);

        // 2. Try to load from IndexedDB first
        const offlineBook = await getBookOffline(bookId);
        let finalData: ArrayBuffer;

        if (offlineBook) {
          console.log("Loading book from IndexedDB...");
          finalData = offlineBook.decryptedData;
          setIsOfflineMode(true);
        } else {
          console.log("Fetching book from network...");
          const response = await fetch(signedUrl);
          if (!response.ok) throw new Error("Failed to fetch book content");

          const blob = await response.blob();

          if (isEncrypted && encryptionKey) {
            const { encryptedData, iv } = await unpackEncryptedBlob(blob);
            const key = await importKey(encryptionKey);
            finalData = await decryptData(encryptedData, key, iv);
          } else {
            finalData = await blob.arrayBuffer();
          }

          try {
            await saveBookOffline(bookId, {
              title: "Unknown", 
              decryptedData: finalData,
            });
          } catch (saveErr) {
            console.warn("Failed to save book for offline:", saveErr);
          }
        }

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(finalData) });
        const doc = await loadingTask.promise;
        setPdfDocument(doc);

        // 3. Extract Outline (ToC)
        const rawOutline = await doc.getOutline();
        if (rawOutline) {
          const resolvedOutline = await Promise.all(
            rawOutline.map(async (item: any) => resolveOutlineItem(doc, item))
          );
          setOutline(resolvedOutline);
        }
      } catch (err) {
        console.error("Reader loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setIsLoading(false);
      }
    }

    loadPdf();
  }, [bookId, signedUrl, isEncrypted, encryptionKey]);

  // Helper to resolve page numbers for outline items
  async function resolveOutlineItem(doc: PdfJS.PDFDocumentProxy, item: any): Promise<PdfOutlineItem> {
    let pageNumber: number | undefined;
    
    try {
      if (item.dest) {
        const dest = typeof item.dest === "string" 
          ? await doc.getDestination(item.dest) 
          : item.dest;
        
        if (dest && dest.length > 0) {
          const pageIndex = await doc.getPageIndex(dest[0]);
          pageNumber = pageIndex + 1;
        }
      }
    } catch (e) {
      console.warn("Could not resolve page for outline item:", item.title, e);
    }

    const items = item.items 
      ? await Promise.all(item.items.map((i: any) => resolveOutlineItem(doc, i)))
      : [];

    return {
      title: item.title,
      dest: item.dest,
      items,
      pageNumber,
    };
  }

  const addBookmark = async (label?: string) => {
    try {
      const res = await addBookmarkAction(bookId, currentPage, label);
      if (res.success) {
        const newBookmark = {
          id: res.id,
          bookId,
          pageNumber: currentPage,
          label: label || `Page ${currentPage}`,
          createdAt: new Date(),
        };
        setBookmarks((prev) => [newBookmark, ...prev]);
      }
    } catch (err) {
      console.error("Failed to add bookmark:", err);
    }
  };

  const removeBookmark = async (bookmarkId: string) => {
    try {
      const res = await removeBookmarkAction(bookmarkId, bookId);
      if (res.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      }
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  // Sync progress with backend (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== initialPage) {
        updateReadingProgressAction(bookId, currentPage).catch(async (err) => {
          console.warn("Failed to sync progress, queueing for offline...", err);
          const { queueSyncTask } = await import("@/lib/db/sync-queue");
          await queueSyncTask("reading_progress", { bookId, pageNumber: currentPage });
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [bookId, currentPage, initialPage]);

  const goToPage = useCallback((page: number) => {
    // In two-page mode, we always want to start a spread on an odd page
    // (e.g. 1-2, 3-4, 5-6) or simply allow jumping to any page and let renderer handle the pair.
    // For now, we allow jumping to any page.
    setCurrentPage(page);
  }, []);

  const toggleTwoPageMode = useCallback(() => {
    setIsTwoPageMode((prev) => !prev);
  }, []);

  const changeTheme = useCallback((newTheme: ReaderTheme) => {
    setTheme(newTheme);
  }, []);

  const changeZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.5), 3.0));
  }, []);

  return {
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
  };
}
