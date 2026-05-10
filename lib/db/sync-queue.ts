/**
 * Sync Queue for Offline Progress
 */

const SYNC_DB_NAME = 'PageTurnerSyncDB';
const SYNC_DB_VERSION = 1;
const STORE_SYNC = 'sync_queue';

export async function initSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SYNC_DB_NAME, SYNC_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_SYNC)) {
        db.createObjectStore(STORE_SYNC, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueSyncTask(type: 'reading_progress', data: any): Promise<void> {
  const db = await initSyncDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SYNC, 'readwrite');
    const store = transaction.objectStore(STORE_SYNC);
    const request = store.add({ type, data, timestamp: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSyncQueue(): Promise<any[]> {
  const db = await initSyncDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SYNC, 'readonly');
    const store = transaction.objectStore(STORE_SYNC);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearSyncTask(id: number): Promise<void> {
  const db = await initSyncDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_SYNC, 'readwrite');
    const store = transaction.objectStore(STORE_SYNC);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
