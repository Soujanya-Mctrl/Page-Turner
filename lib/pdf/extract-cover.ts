/**
 * Extracts the first page of a PDF as a Blob (image/webp)
 * to be used as a cover image.
 */
export async function extractPdfCover(file: File): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("extractPdfCover can only be called on the client");
  }

  // Dynamically import pdfjs to avoid SSR issues with DOMMatrix
  const pdfjs = await import("pdfjs-dist");
  
  // Set worker from CDN
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const scale = 1.5;
  const viewport = page.getViewport({ scale });

  // Create a canvas element to render the page
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Could not get canvas context");
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  };

  await page.render(renderContext).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      },
      "image/webp",
      0.8 // Quality
    );
  });
}

/**
 * Gets total pages from a PDF file.
 */
export async function getPdfPageCount(file: File): Promise<number> {
  if (typeof window === "undefined") {
    throw new Error("getPdfPageCount can only be called on the client");
  }

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  return pdf.numPages;
}
