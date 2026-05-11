"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getPublicUrl } from "@/lib/utils/url";

interface BookCardProps {
  id: string;
  title: string;
  coverUrl: string | null;
  progress: number;
  isEncrypted?: boolean;
  isManageMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

import { useState, useEffect } from "react";
import { getBookOffline } from "@/lib/db/indexeddb";
import Link from "next/link";
import { cn } from "@/components/ui/button";

export function BookCard({ 
  id, 
  title, 
  coverUrl, 
  progress, 
  isEncrypted,
  isManageMode = false,
  isSelected = false,
  onToggleSelection
}: BookCardProps) {
  const finalCoverUrl = getPublicUrl(coverUrl);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    getBookOffline(id).then((book) => {
      if (book) setIsOffline(true);
    });
  }, [id]);

  const CardContent = (
    <motion.div
      whileHover={isManageMode ? {} : { y: -5 }}
      className={cn(
        "group relative flex flex-col gap-2 cursor-pointer transition-all",
        isSelected && "scale-[0.98]"
      )}
      onClick={() => isManageMode && onToggleSelection?.(id)}
    >
      <div className={cn(
        "relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100 shadow-md transition-all ring-offset-2",
        isSelected ? "ring-2 ring-indigo-500 shadow-indigo-100 shadow-lg" : "group-hover:shadow-xl"
      )}>
        {finalCoverUrl ? (
          <Image
            src={finalCoverUrl}
            alt={title}
            fill
            className={cn(
              "object-cover transition-transform",
              !isManageMode && "group-hover:scale-105",
              isSelected && "opacity-80"
            )}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-200">
            <span className="text-4xl">📖</span>
          </div>
        )}
        
        {/* Selection Indicator */}
        {isManageMode && (
          <div className="absolute top-3 left-3 z-20">
            {isSelected ? (
              <span className="material-symbols-outlined text-[24px] text-indigo-600 bg-white rounded-full">
                check_circle
              </span>
            ) : (
              <span className="material-symbols-outlined text-[24px] text-white opacity-60">
                radio_button_unchecked
              </span>
            )}
          </div>
        )}

        {/* Offline Badge */}
        {isOffline && !isManageMode && (
          <div className="absolute top-2 right-2 rounded-full bg-green-500/80 p-1 text-white backdrop-blur-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-[12px]">wifi_off</span>
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
          <h3 className={cn(
            "line-clamp-2 text-sm font-semibold leading-tight transition-colors",
            isSelected ? "text-indigo-700" : "text-gray-800"
          )}>
            {title}
          </h3>
          <div className="flex gap-1 mt-0.5 shrink-0">
            {isOffline && <span className="material-symbols-outlined text-[14px] text-green-500">wifi_off</span>}
            {isEncrypted && (
              <span className="material-symbols-outlined text-[14px] text-indigo-400">lock</span>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {progress === 0 ? "Not started" : `${progress}% read`}
        </p>
      </div>
    </motion.div>
  );

  if (isManageMode) {
    return CardContent;
  }

  return (
    <Link href={`/read/${id}`}>
      {CardContent}
    </Link>
  );
}

