"use client";

import { useState, useEffect } from "react";
import { extractPdfCover, getPdfPageCount } from "@/lib/pdf/extract-cover";
import { createBookAction } from "@/lib/actions/book";
import { getPresignedUploadUrl } from "@/lib/actions/storage";
import { 
  generateKey, 
  exportKey, 
  encryptData, 
  packEncryptedBlob 
} from "@/lib/encryption";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadButtonProps {
  onUploadStart?: (files: File[]) => void;
  onUploadProgress?: (fileName: string, status: string, progress: number) => void;
  onUploadComplete?: () => void;
}

const uuid = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export function UploadButton({ onUploadStart, onUploadProgress, onUploadComplete }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    console.log("[UploadButton] Mounted");
  }, []);

  const processFile = async (file: File) => {
    console.log("Starting upload for file:", file.name);

    // 1. Extract cover and page count
    setUploadStatus(`Analyzing ${file.name}...`);
    onUploadProgress?.(file.name, "Analyzing...", 10);
    const coverBlob = await extractPdfCover(file);
    const totalPages = await getPdfPageCount(file);

    // 2. Encryption (Zero-Knowledge)
    setUploadStatus(`Encrypting ${file.name}...`);
    onUploadProgress?.(file.name, "Encrypting...", 30);
    const pdfBuffer = await file.arrayBuffer();
    const key = await generateKey();
    const { encryptedData, iv } = await encryptData(pdfBuffer, key);
    const encryptedBlob = packEncryptedBlob(encryptedData, iv);
    const exportedKey = await exportKey(key);

    // 3. Upload Encrypted PDF to R2
    setUploadStatus(`Uploading ${file.name}...`);
    onUploadProgress?.(file.name, "Uploading PDF...", 50);
    const pdfKey = `books/${uuid()}.pdf.enc`;
    const pdfUploadUrl = await getPresignedUploadUrl(pdfKey, "application/octet-stream");
    
    const pdfResponse = await fetch(pdfUploadUrl, {
      method: "PUT",
      body: encryptedBlob,
      headers: { "Content-Type": "application/octet-stream" },
    });

    if (!pdfResponse.ok) {
      throw new Error(`Failed to upload PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
    }

    // 4. Upload Cover to R2 (Public/Unencrypted)
    const coverKey = `covers/${uuid()}.webp`;
    const coverUploadUrl = await getPresignedUploadUrl(coverKey, "image/webp");
    
    const coverResponse = await fetch(coverUploadUrl, {
      method: "PUT",
      body: coverBlob,
      headers: { "Content-Type": "image/webp" },
    });

    if (!coverResponse.ok) {
      throw new Error(`Failed to upload cover: ${coverResponse.status} ${coverResponse.statusText}`);
    }

    // 5. Save to Database
    setUploadStatus(`Saving ${file.name}...`);
    onUploadProgress?.(file.name, "Saving...", 95);
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

    onUploadProgress?.(file.name, "Done", 100);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type === "application/pdf");
    if (files.length === 0) return;

    setIsUploading(true);
    setBatchProgress({ current: 0, total: files.length });
    onUploadStart?.(files);

    try {
      for (let i = 0; i < files.length; i++) {
        setBatchProgress({ current: i + 1, total: files.length });
        await processFile(files[i]);
      }
      
      toast.success(`Successfully uploaded ${files.length} books!`);
    } catch (error) {
      console.error("Batch upload failed:", error);
      let errorMessage = "Failed to upload books.";
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage = "Network error or CORS violation. Please ensure your storage bucket allows requests from this origin.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      setUploadStatus(null);
      setBatchProgress(null);
      // Reset input
      e.target.value = "";
      onUploadComplete?.();
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="book-upload"
        accept="application/pdf"
        multiple
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
                <span className="material-symbols-outlined text-[24px] animate-spin text-white">
                  progress_activity
                </span>
                {(uploadStatus || batchProgress) && (
                  <div className="absolute top-16 whitespace-nowrap flex flex-col items-center gap-1">
                    {batchProgress && (
                      <span className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full shadow-sm">
                        {batchProgress.current} / {batchProgress.total}
                      </span>
                    )}
                    {uploadStatus && (
                      <span className="text-xs font-medium text-indigo-600 bg-white px-2 py-1 rounded shadow-sm border border-indigo-100 max-w-[200px] truncate">
                        {uploadStatus}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <span className="material-symbols-outlined text-[28px] text-white group-hover:scale-110 transition-transform">
                add
              </span>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}

