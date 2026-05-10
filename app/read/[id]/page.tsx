import { getBookDetailsAction } from "@/lib/actions/reading";
import { getPresignedDownloadUrl } from "@/lib/actions/storage";
import { ReaderContainer } from "../../../components/reader/ReaderContainer";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  let book;
  let signedUrl;

  try {
    book = await getBookDetailsAction(id);
    
    // Generate a signed URL for the encrypted PDF
    // It's a "key" in the DB if it doesn't start with http
    signedUrl = book.blobUrl.startsWith('http') 
      ? book.blobUrl 
      : await getPresignedDownloadUrl(book.blobUrl, 3600 * 4); // 4 hour expiry
  } catch (error) {
    console.error("Failed to load book for reading:", error);
    notFound();
  }

  return (
    <ReaderContainer 
      book={{
        id: book.id,
        title: book.title,
        isEncrypted: book.isEncrypted === 1,
        encryptionKey: book.encryptionKey || undefined,
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage,
        signedUrl: signedUrl
      }} 
    />
  );
}
