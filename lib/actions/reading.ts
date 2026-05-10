"use server";

import { db } from "@/db";
import { books, readingProgress } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateReadingProgressAction(bookId: string, pageNumber: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Update the main book record
  await db
    .update(books)
    .set({ 
      currentPage: pageNumber,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(books.id, bookId),
        eq(books.userId, session.user.id)
      )
    );

  // 2. Add to reading history
  const progressId = crypto.randomUUID();
  await db.insert(readingProgress).values({
    id: progressId,
    userId: session.user.id,
    bookId: bookId,
    pageNumber: pageNumber,
  });

  revalidatePath("/");
  revalidatePath(`/read/${bookId}`);
  
  return { success: true };
}

export async function getBookDetailsAction(bookId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const book = await db.query.books.findFirst({
    where: (books, { eq, and }) => 
      and(
        eq(books.id, bookId),
        eq(books.userId, session.user.id)
      ),
  });

  if (!book) {
    throw new Error("Book not found");
  }

  return book;
}
