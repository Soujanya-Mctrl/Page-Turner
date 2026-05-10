import { getBookDetailsAction } from "@/lib/actions/reading";
import { getPresignedDownloadUrl } from "@/lib/actions/storage";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReaderWrapper } from "@/components/reader/ReaderWrapper";

export default async function ReadPage(props: PageProps<"/read/[id]">) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Fetch book and generate signed URL
  // We use a pattern that keeps types safe without 'any' or 'let' outside try/catch
  const getBookData = async () => {
    try {
      const book = await getBookDetailsAction(id);
      const signedUrl = book.blobUrl.startsWith("http")
        ? book.blobUrl
        : await getPresignedDownloadUrl(book.blobUrl, 3600 * 4);
      
      return { book, signedUrl };
    } catch (error) {
      console.error("Failed to load book for reading:", error);
      return null;
    }
  };

  const data = await getBookData();

  if (!data) {
    notFound();
  }

  const { book, signedUrl } = data;

  return (
    <ReaderWrapper
      book={{
        id: book.id,
        title: book.title,
        isEncrypted: book.isEncrypted === 1,
        encryptionKey: book.encryptionKey || undefined,
        totalPages: book.totalPages || 0,
        currentPage: book.currentPage,
        signedUrl: signedUrl,
      }}
    />
  );
}
