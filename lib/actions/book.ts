"use server";

import { db } from "@/db";
import { books } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { getPresignedDownloadUrl } from "./storage";

export async function createBookAction(data: {
  title: string;
  blobUrl: string;
  coverUrl?: string;
  totalPages?: number;
  isEncrypted?: boolean;
  encryptionKey?: string;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const bookId = crypto.randomUUID();

  await db.insert(books).values({
    id: bookId,
    userId: session.user.id,
    title: data.title,
    blobUrl: data.blobUrl,
    coverUrl: data.coverUrl,
    totalPages: data.totalPages,
    isEncrypted: data.isEncrypted ? 1 : 0,
    encryptionKey: data.encryptionKey,
  });

  revalidatePath("/");
  return { success: true, bookId };
}

export async function getBooksAction() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const userBooks = await db.query.books.findMany({
    where: (books, { eq }) => eq(books.userId, session.user.id),
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
