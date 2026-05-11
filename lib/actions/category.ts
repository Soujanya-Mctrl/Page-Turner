"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(name: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const id = crypto.randomUUID();
    await db.insert(categories).values({
      id,
      userId: session.user.id,
      name,
    });

    revalidatePath("/");
    return { success: true, categoryId: id };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Database error" };
  }
}

export async function getCategoriesAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }

  try {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, session.user.id))
      .orderBy(categories.name);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .delete(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, session.user.id)
        )
      );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Database error" };
  }
}
