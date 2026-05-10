"use client";

import dynamic from "next/dynamic";

const ReaderContainer = dynamic(
  () => import("./ReaderContainer").then((mod) => mod.ReaderContainer),
  { ssr: false }
);

export function ReaderWrapper({ book }: { book: any }) {
  return <ReaderContainer book={book} />;
}
