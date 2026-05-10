"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getPublicUrl } from "@/lib/utils/url";
import { Lock } from "lucide-react";

interface BookCardProps {
  title: string;
  coverUrl: string | null;
  progress: number;
  isEncrypted?: boolean;
}

export function BookCard({ title, coverUrl, progress, isEncrypted }: BookCardProps) {
  const finalCoverUrl = getPublicUrl(coverUrl);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col gap-2 cursor-pointer"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 shadow-md transition-shadow group-hover:shadow-xl">
        {finalCoverUrl ? (
          <Image
            src={finalCoverUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-200">
            <span className="text-4xl">📖</span>
          </div>
        )}
        
        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-black/20 backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-indigo-500"
          />
        </div>
      </div>
      
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-800 leading-tight">
            {title}
          </h3>
          {isEncrypted && (
            <Lock className="h-3 w-3 text-indigo-400 mt-0.5 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progress === 0 ? "Not started" : `${progress}% read`}
        </p>
      </div>
    </motion.div>
  );
}
