"use client";

import { useReader } from "@/hooks/useReader";
import { PdfRenderer } from "./PdfRenderer";
import { ReaderHeader } from "./ReaderHeader";
import { ReaderOverlay } from "./ReaderOverlay";
import { Loader2 } from "lucide-react";

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
    goToPage,
    changeTheme,
    changeZoom,
  } = useReader({
    bookId: book.id,
    signedUrl: book.signedUrl,
    isEncrypted: book.isEncrypted,
    encryptionKey: book.encryptionKey,
    initialPage: book.currentPage,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500 font-medium">Decrypting & Loading your book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Error loading book</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!pdfDocument) return null;

  return (
    <div className={`min-h-screen select-none`}>
      <ReaderHeader 
        title={book.title} 
        theme={theme} 
        setTheme={changeTheme} 
      />
      
      <main className="overflow-auto h-screen">
        <PdfRenderer
          pdfDocument={pdfDocument}
          pageNumber={currentPage}
          zoom={zoom}
          theme={theme}
        />
      </main>

      <ReaderOverlay
        currentPage={currentPage}
        totalPages={pdfDocument.numPages}
        onPageChange={goToPage}
        onZoomChange={changeZoom}
      />
    </div>
  );
}
