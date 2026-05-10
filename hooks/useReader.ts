"use client";

import { useState, useEffect, useCallback } from "react";
import { importKey, decryptData, unpackEncryptedBlob } from "@/lib/encryption";
import { updateReadingProgressAction } from "@/lib/actions/reading";
import * as pdfjs from "pdfjs-dist";

// Worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface UseReaderProps {
  bookId: string;
  signedUrl: string;
  isEncrypted: boolean;
  encryptionKey?: string;
  initialPage?: number;
}

export type ReaderTheme = "light" | "dark" | "sepia";

export function useReader({
  bookId,
  signedUrl,
  isEncrypted,
  encryptionKey,
  initialPage = 1,
}: UseReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ReaderTheme>("light");
  const [zoom, setZoom] = useState(1.0);

  // Load and decrypt PDF
  useEffect(() => {
    async function loadPdf() {
      try {
        setIsLoading(true);
        const response = await fetch(signedUrl);
        if (!response.ok) throw new Error("Failed to fetch book content");

        const blob = await response.blob();
        let finalData: ArrayBuffer;

        if (isEncrypted && encryptionKey) {
          const { encryptedData, iv } = await unpackEncryptedBlob(blob);
          const key = await importKey(encryptionKey);
          finalData = await decryptData(encryptedData, key, iv);
        } else {
          finalData = await blob.arrayBuffer();
        }

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(finalData) });
        const doc = await loadingTask.promise;
        setPdfDocument(doc);
      } catch (err) {
        console.error("Reader loading error:", err);
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setIsLoading(false);
      }
    }

    loadPdf();
  }, [signedUrl, isEncrypted, encryptionKey]);

  // Sync progress with backend (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== initialPage) {
        updateReadingProgressAction(bookId, currentPage).catch(console.error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [bookId, currentPage, initialPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
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
    goToPage,
    changeTheme,
    changeZoom,
  };
}
