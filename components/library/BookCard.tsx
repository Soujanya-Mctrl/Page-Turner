"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getPublicUrl } from "@/lib/utils/url";
import { Lock } from "lucide-react";
import Link from "next/link";

interface BookCardProps {
  id: string;
  title: string;
  coverUrl: string | null;
  progress: number;
  isEncrypted?: boolean;
}

import { useState, useEffect } from "react";
import { getBookOffline } from "@/lib/db/indexeddb";
import { WifiOff } from "lucide-react";

export function BookCard({ id, title, coverUrl, progress, isEncrypted }: BookCardProps) {
  const finalCoverUrl = getPublicUrl(coverUrl);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    getBookOffline(id).then((book) => {
      if (book) setIsOffline(true);
    });
  }, [id]);

  return (
    <Link href={`/read/${id}`}>
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
        
        {/* Offline Badge */}
        {isOffline && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500/80 p-1 text-white backdrop-blur-sm">
            <WifiOff className="h-3 w-3" />
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
          <div className="flex gap-1 mt-0.5 shrink-0">
            {isOffline && <WifiOff className="h-3 w-3 text-green-500" />}
            {isEncrypted && (
              <Lock className="h-3 w-3 text-indigo-400" />
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progress === 0 ? "Not started" : `${progress}% read`}
        </p>
      </div>
    </motion.div>
    </Link>
  );
}
