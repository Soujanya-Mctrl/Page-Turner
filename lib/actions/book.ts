"use server";

import { db } from "@/db";
import { books } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and, inArray } from "drizzle-orm";

import { getPresignedDownloadUrl, deleteFromStorageAction } from "./storage";

import { randomUUID } from "node:crypto";

const uuid = () => randomUUID();

export async function createBookAction(data: {
  title: string;
  blobUrl: string;
  coverUrl?: string;
  totalPages?: number;
  isEncrypted?: boolean;
  encryptionKey?: string;
  categoryId?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    console.error("[createBookAction] No session or user ID found");
    throw new Error("Unauthorized");
  }

  const bookId = uuid();
  console.log(`[createBookAction] Creating book for user ${session.user.id}: ${data.title} (ID: ${bookId})`);

  await db.insert(books).values({
    id: bookId,
    userId: session.user.id,
    title: data.title,
    blobUrl: data.blobUrl,
    coverUrl: data.coverUrl,
    totalPages: data.totalPages,
    isEncrypted: data.isEncrypted ? 1 : 0,
    encryptionKey: data.encryptionKey,
    categoryId: data.categoryId,
  });

  revalidatePath("/");
  return { success: true, bookId };
}

export async function getBooksAction(categoryId?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    console.warn("[getBooksAction] No session found or missing user ID. Session state:", JSON.stringify(session));
    return [];
  }

  console.log(`[getBooksAction] Fetching books for user ID: ${session.user.id}${categoryId ? ` in category ${categoryId}` : ''}`);

  const userBooks = await db.query.books.findMany({
    where: (books, { eq, and }) => 
      categoryId 
        ? and(eq(books.userId, session.user.id), eq(books.categoryId, categoryId))
        : eq(books.userId, session.user.id),
    orderBy: (books, { desc }) => [desc(books.createdAt)],
  });

  // Generate signed URLs for all books
  const signedBooks = await Promise.all(userBooks.map(async (book) => {
    let signedCoverUrl = book.coverUrl;
    let signedBlobUrl = book.blobUrl;

    try {
      if (book.coverUrl && !book.coverUrl.startsWith('http')) {
        signedCoverUrl = await getPresignedDownloadUrl(book.coverUrl);
      }
      if (book.blobUrl && !book.blobUrl.startsWith('http')) {
        signedBlobUrl = await getPresignedDownloadUrl(book.blobUrl);
      }
    } catch (error) {
      console.error(`Failed to sign URL for book ${book.id}:`, error);
    }

    return {
      ...book,
      coverUrl: signedCoverUrl,
      blobUrl: signedBlobUrl,
    };
  }));

  return signedBooks;
}

export async function deleteBookAction(bookId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const book = await db.query.books.findFirst({
      where: (books, { eq, and }) => and(eq(books.id, bookId), eq(books.userId, session.user.id)),
    });

    if (!book) return { success: false, error: "Book not found" };

    // 1. Delete from Storage
    console.log(`[deleteBookAction] Deleting storage for book: ${book.title} (${bookId})`);
    
    // We run these and ignore minor errors to ensure we at least try both
    const storagePromises = [];
    if (book.blobUrl) storagePromises.push(deleteFromStorageAction(book.blobUrl));
    if (book.coverUrl) storagePromises.push(deleteFromStorageAction(book.coverUrl));
    
    await Promise.allSettled(storagePromises);

    // 2. Delete from DB
    console.log(`[deleteBookAction] Deleting DB record for book: ${bookId}`);
    await db.delete(books).where(eq(books.id, bookId));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[deleteBookAction] Error:", error);
    return { success: false, error: "Deletion failed" };
  }
}

export async function batchDeleteBooksAction(bookIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    const userBooks = await db.select().from(books).where(
      and(
        inArray(books.id, bookIds),
        eq(books.userId, session.user.id)
      )
    );

    // Delete files from storage
    console.log(`[batchDeleteBooksAction] Deleting storage for ${userBooks.length} books`);
    const storageTasks = userBooks.flatMap(book => {
      const tasks = [];
      if (book.blobUrl) tasks.push(deleteFromStorageAction(book.blobUrl));
      if (book.coverUrl) tasks.push(deleteFromStorageAction(book.coverUrl));
      return tasks;
    });

    // Use allSettled to ensure one failure doesn't block others
    await Promise.allSettled(storageTasks);

    // Delete from DB
    console.log(`[batchDeleteBooksAction] Deleting ${bookIds.length} DB records`);
    await db.delete(books).where(inArray(books.id, bookIds));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("[batchDeleteBooksAction] Error:", error);
    return { success: false, error: "Batch deletion failed" };
  }
}

export async function updateBookCategoryAction(bookIds: string[], categoryId: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  try {
    await db.update(books)
      .set({ categoryId })
      .where(
        and(
          inArray(books.id, bookIds),
          eq(books.userId, session.user.id)
        )
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to update category:", error);
    return { success: false, error: "Update failed" };
  }
}
