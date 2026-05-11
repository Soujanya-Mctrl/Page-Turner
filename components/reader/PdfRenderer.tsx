"use client";

import React, { useEffect, useRef, useState, forwardRef } from "react";
import type * as PdfJS from "pdfjs-dist";
import HTMLFlipBook from "react-pageflip";

interface PdfRendererProps {
  pdfDocument: PdfJS.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  theme: "light" | "dark" | "sepia";
  isTwoPageMode?: boolean;
  onPageFlip?: (pageIndex: number) => void;
  flipBookRef?: React.MutableRefObject<any>;
}

const Page = forwardRef<HTMLDivElement, { number: number; children: React.ReactNode }>(
  (props, ref) => {
    return (
      <div 
        className="page bg-white premium-shadow rounded-lg border border-outline-variant/10 overflow-hidden flex items-center justify-center" 
        ref={ref}
        data-density="hard" 
      >
        {props.children}
      </div>
    );
  }
);
Page.displayName = "Page";

export function PdfRenderer({
  pdfDocument,
  pageNumber,
  zoom,
  theme,
  isTwoPageMode = false,
  onPageFlip,
  flipBookRef,
}: PdfRendererProps) {
  const themeColors = {
    light: "bg-transparent",
    dark: "bg-transparent invert brightness-90",
    sepia: "bg-transparent sepia-[.3] contrast-[.9]",
  };

  // Generate an array for all pages
  const pages = Array.from({ length: pdfDocument.numPages }, (_, i) => i + 1);

  // Sync external pageNumber to flipbook
  useEffect(() => {
    if (flipBookRef?.current?.pageFlip) {
      const flipbook = flipBookRef.current.pageFlip();
      if (flipbook) {
        const currentPageIndex = flipbook.getCurrentPageIndex();
        // The external pageNumber is 1-indexed, while the flipbook is 0-indexed
        if (currentPageIndex !== pageNumber - 1) {
          flipbook.flip(pageNumber - 1);
        }
      }
    }
  }, [pageNumber, flipBookRef]);

  return (
    <div className={`relative flex items-center justify-center h-full w-full p-4 sm:p-8 ${themeColors[theme]} transition-colors duration-500 overflow-hidden`}>
      {/* @ts-ignore - HTMLFlipBook types are slightly restrictive but it works fine */}
      <HTMLFlipBook
        width={400 * zoom}
        height={600 * zoom}
        size="stretch"
        minWidth={300}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1500}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        className="demo-book"
        ref={flipBookRef}
        onFlip={(e: any) => {
          if (onPageFlip) {
            // e.data contains the new 0-indexed page index
            onPageFlip(e.data + 1); 
          }
        }}
        usePortrait={!isTwoPageMode}
      >
        {pages.map((pageNum) => (
          <Page key={pageNum} number={pageNum}>
            <LazyPageCanvas
              pdfDocument={pdfDocument}
              pageNumber={pageNum}
              zoom={zoom}
              currentPage={pageNumber}
            />
          </Page>
        ))}
      </HTMLFlipBook>
    </div>
  );
}

function LazyPageCanvas({
  pdfDocument,
  pageNumber,
  zoom,
  currentPage,
}: {
  pdfDocument: PdfJS.PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  currentPage: number;
}) {
  // Render canvas if within 3 pages of the current page to save memory
  const shouldRender = Math.abs(pageNumber - currentPage) <= 3;

  if (!shouldRender) {
    return <div className="w-full h-full bg-white flex items-center justify-center text-gray-300">Loading...</div>;
  }

  return <PageCanvas pdfDocument={pdfDocument} pageNumber={pageNumber} zoom={zoom} />;
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
        
        if (isAborted) return;

        // Render at a higher scale for sharpness, then CSS will scale it down
        const viewport = page.getViewport({ scale: zoom * 2 }); 

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
    <div className="relative w-full h-full flex items-center justify-center bg-white">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
      
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[2px]">
          <span className="material-symbols-outlined text-[32px] animate-spin text-secondary">progress_activity</span>
        </div>
      )}
    </div>
  );
}
