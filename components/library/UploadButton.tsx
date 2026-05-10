"use client";

import { useState } from "react";
import { extractPdfCover, getPdfPageCount } from "@/lib/pdf/extract-cover";
import { createBookAction } from "@/lib/actions/book";
import { getPresignedUploadUrl } from "@/lib/actions/storage";
import { 
  generateKey, 
  exportKey, 
  encryptData, 
  packEncryptedBlob 
} from "@/lib/encryption";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UploadButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return;

    console.log("Starting upload for file:", file.name);

    try {
      setIsUploading(true);
      setUploadStatus("Processing PDF...");

      // 1. Extract cover and page count
      console.log("Step 1: Extracting cover and page count...");
      const coverBlob = await extractPdfCover(file);
      const totalPages = await getPdfPageCount(file);
      console.log("Cover extracted and pages counted:", totalPages);

      // 2. Encryption (Zero-Knowledge)
      setUploadStatus("Encrypting...");
      console.log("Step 2: Encrypting PDF...");
      const pdfBuffer = await file.arrayBuffer();
      const key = await generateKey();
      const { encryptedData, iv } = await encryptData(pdfBuffer, key);
      const encryptedBlob = packEncryptedBlob(encryptedData, iv);
      const exportedKey = await exportKey(key);
      console.log("PDF encrypted successfully");

      // 3. Upload Encrypted PDF to R2
      setUploadStatus("Uploading PDF...");
      const pdfKey = `books/${crypto.randomUUID()}.pdf.enc`;
      console.log("Step 3: Getting presigned URL for PDF upload...", pdfKey);
      const pdfUploadUrl = await getPresignedUploadUrl(pdfKey, "application/octet-stream");
      console.log("PDF upload URL obtained");
      
      const pdfResponse = await fetch(pdfUploadUrl, {
        method: "PUT",
        body: encryptedBlob,
        headers: { "Content-Type": "application/octet-stream" },
      });

      if (!pdfResponse.ok) {
        throw new Error(`Failed to upload PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }
      console.log("PDF uploaded successfully to S3");

      // 4. Upload Cover to R2 (Public/Unencrypted)
      setUploadStatus("Uploading Cover...");
      const coverKey = `covers/${crypto.randomUUID()}.webp`;
      console.log("Step 4: Getting presigned URL for cover upload...", coverKey);
      const coverUploadUrl = await getPresignedUploadUrl(coverKey, "image/webp");
      console.log("Cover upload URL obtained");
      
      const coverResponse = await fetch(coverUploadUrl, {
        method: "PUT",
        body: coverBlob,
        headers: { "Content-Type": "image/webp" },
      });

      if (!coverResponse.ok) {
        throw new Error(`Failed to upload cover: ${coverResponse.status} ${coverResponse.statusText}`);
      }
      console.log("Cover uploaded successfully to S3");

      // 5. Save to Database
      setUploadStatus("Saving...");
      console.log("Step 5: Saving book to database...");
      const result = await createBookAction({
        title: file.name.replace(".pdf", ""),
        blobUrl: pdfKey,
        coverUrl: coverKey,
        totalPages,
        isEncrypted: true,
        encryptionKey: exportedKey,
      });

      if (!result.success) {
        throw new Error("Failed to save book to database");
      }
      console.log("Book saved to database successfully:", result.bookId);

      alert("Book uploaded and encrypted successfully!");
    } catch (error) {
      console.error("Upload failed at some point:", error);
      
      let errorMessage = "Failed to upload book.";
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Network error or CORS violation. Please ensure your storage bucket allows requests from this origin.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="book-upload"
        accept="application/pdf"
        className="hidden"
        onChange={handleUpload}
        disabled={isUploading}
      />
      <label htmlFor="book-upload">
        <Button
          variant="default"
          className="rounded-full h-14 w-14 shadow-lg flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 transition-all group"
          disabled={isUploading}
          asChild
        >
          <span className="cursor-pointer relative">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                {uploadStatus && (
                  <span className="absolute top-16 whitespace-nowrap text-xs font-medium text-indigo-600 bg-white px-2 py-1 rounded shadow-sm border border-indigo-100">
                    {uploadStatus}
                  </span>
                )}
              </div>
            ) : (
              <Plus className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}
