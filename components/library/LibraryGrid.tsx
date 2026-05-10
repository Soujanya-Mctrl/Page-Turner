"use client";

import { useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { getBooksAction } from "@/lib/actions/book";
import dynamic from "next/dynamic";

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
}

export function LibraryGrid() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getBooksAction();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 animate-pulse">
            <div className="aspect-[3/4] w-full rounded-xl bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 sm:p-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Library</h1>
          <p className="text-gray-500">{books.length} {books.length === 1 ? 'book' : 'books'} available</p>
        </div>
      </header>

      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h2 className="text-xl font-semibold text-gray-900">Your shelf is empty</h2>
          <p className="text-gray-500 max-w-xs mt-2">
            Upload your first PDF to start your premium reading experience.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              id={book.id}
              title={book.title}
              coverUrl={book.coverUrl}
              progress={Math.round((book.currentPage / (book.totalPages || 1)) * 100)}
              isEncrypted={book.isEncrypted === 1}
            />
          ))}
        </div>
      )}

      {/* Fixed FAB for upload */}
      <div className="fixed bottom-8 right-8 z-50">
        <UploadButton />
      </div>
    </div>
  );
}
