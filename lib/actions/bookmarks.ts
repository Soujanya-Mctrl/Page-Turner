"use server";

import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addBookmarkAction(bookId: string, pageNumber: number, label?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const id = crypto.randomUUID();
  await db.insert(bookmarks).values({
    id,
    userId: session.user.id,
    bookId,
    pageNumber,
    label: label || `Page ${pageNumber}`,
  });

  revalidatePath(`/read/${bookId}`);
  return { success: true, id };
}

export async function removeBookmarkAction(bookmarkId: string, bookId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db.delete(bookmarks).where(
    and(
      eq(bookmarks.id, bookmarkId),
      eq(bookmarks.userId, session.user.id)
    )
  );

  revalidatePath(`/read/${bookId}`);
  return { success: true };
}

export async function getBookmarksAction(bookId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await db.query.bookmarks.findMany({
    where: (bookmarks, { eq, and }) =>
      and(
        eq(bookmarks.bookId, bookId),
        eq(bookmarks.userId, session.user.id)
      ),
    orderBy: [desc(bookmarks.createdAt)],
  });
}
