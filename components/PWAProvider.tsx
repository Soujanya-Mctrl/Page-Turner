'use client'

import { useEffect } from 'react'

import { getSyncQueue, clearSyncTask } from '@/lib/db/sync-queue'
import { updateReadingProgressAction } from '@/lib/actions/reading'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 1. Register Service Worker
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.serwist === undefined
    ) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // 2. Handle Online Event to flush sync queue
    const handleOnline = async () => {
      console.log('App is back online, flushing sync queue...')
      const queue = await getSyncQueue()
      for (const task of queue) {
        if (task.type === 'reading_progress') {
          try {
            await updateReadingProgressAction(task.data.bookId, task.data.pageNumber)
            await clearSyncTask(task.id)
            console.log(`Synced progress for book ${task.data.bookId}`)
          } catch (err) {
            console.error('Failed to sync task, will retry later:', err)
          }
        }
      }
    }

    window.addEventListener('online', handleOnline)
    // Initial check in case we missed the event or are already online
    if (navigator.onLine) {
      handleOnline()
    }

    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return <>{children}</>
}

// Add global type for Serwist if needed, though we are using a custom SW
declare global {
  interface Window {
    serwist: any
  }
}
