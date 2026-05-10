"use client";

import { useEffect, useState } from "react";
import { BookCard } from "./BookCard";
import { getBooksAction } from "@/lib/actions/book";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Library</h1>
          <p className="text-gray-500">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
          </p>
        </div>

        <div className="relative w-full sm:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search your collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </header>

      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-6xl">{searchQuery ? "🔍" : "📚"}</div>
          <h2 className="text-xl font-semibold text-gray-900">
            {searchQuery ? "No matches found" : "Your shelf is empty"}
          </h2>
          <p className="text-gray-500 max-w-xs mt-2">
            {searchQuery 
              ? `We couldn't find any books matching "${searchQuery}"`
              : "Upload your first PDF to start your premium reading experience."}
          </p>
        </div>
      ) : (
        <motion.div 
          layout
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <BookCard
                  id={book.id}
                  title={book.title}
                  coverUrl={book.coverUrl}
                  progress={Math.round((book.currentPage / (book.totalPages || 1)) * 100)}
                  isEncrypted={book.isEncrypted === 1}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Fixed FAB for upload */}
      <div className="fixed bottom-8 right-8 z-50">
        <UploadButton />
      </div>
    </div>
  );
}
