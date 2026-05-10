"use client";

import { useEffect, useRef, useState } from "react";
import type * as PdfJS from "pdfjs-dist";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PdfRendererProps {
  pdfDocument: PdfJS.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  theme: "light" | "dark" | "sepia";
}

export function PdfRenderer({
  pdfDocument,
  pageNumber,
  zoom,
  theme,
}: PdfRendererProps) {
  const [direction, setDirection] = useState(0);
  const prevPageRef = useRef(pageNumber);

  useEffect(() => {
    if (pageNumber > prevPageRef.current) {
      setDirection(1);
    } else if (pageNumber < prevPageRef.current) {
      setDirection(-1);
    }
    prevPageRef.current = pageNumber;
  }, [pageNumber]);

  const themeColors = {
    light: "bg-white",
    dark: "bg-gray-900 invert brightness-90",
    sepia: "bg-[#f4ecd8] sepia-[.3] contrast-[.9]",
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : direction < 0 ? -100 : 0,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : direction > 0 ? -100 : 0,
      opacity: 0,
    }),
  };

  return (
    <div className={`relative flex items-center justify-center min-h-screen p-4 sm:p-8 ${themeColors[theme]} transition-colors duration-500 overflow-hidden`}>
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={`${pageNumber}-${zoom}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="relative shadow-2xl rounded-sm overflow-hidden"
          style={{ maxWidth: "100%" }}
        >
          <PageCanvas
            pdfDocument={pdfDocument}
            pageNumber={pageNumber}
            zoom={zoom}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PageCanvas({
  pdfDocument,
  pageNumber,
  zoom,
}: {
  pdfDocument: PdfJS.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let activeTask: PdfJS.RenderTask | null = null;
    let isAborted = false;

    async function renderPage() {
      if (!canvasRef.current) return;

      try {
        setIsRendering(true);
        const page = await pdfDocument.getPage(pageNumber);
        
        // Check if aborted after async getPage
        if (isAborted) return;

        const viewport = page.getViewport({ scale: zoom * 2 }); // Render at 2x for sharpness

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        activeTask = page.render(renderContext);
        await activeTask.promise;
      } catch (error) {
        if (error instanceof Error && error.name !== "RenderingCancelledException") {
          console.error("PDF render error:", error);
        }
      } finally {
        if (!isAborted) {
          setIsRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isAborted = true;
      if (activeTask) {
        activeTask.cancel();
      }
    };
  }, [pdfDocument, pageNumber, zoom]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto block"
        style={{ 
          width: "auto", 
          height: "auto",
          maxHeight: "calc(100vh - 4rem)" 
        }}
      />
      
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      )}
    </>
  );
}
