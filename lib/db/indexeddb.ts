/**
 * IndexedDB Wrapper for Offline Storage
 * Handles caching of decrypted book data and metadata
 */

const DB_NAME = 'PageTurnerDB';
const DB_VERSION = 1;
const STORE_BOOKS = 'books'; // Stores { id, title, author, decryptedData: ArrayBuffer }

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_BOOKS)) {
        db.createObjectStore(STORE_BOOKS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveBookOffline(id: string, data: {
  title: string;
  author?: string | null;
  decryptedData: ArrayBuffer;
  totalPages?: number | null;
  coverUrl?: string | null;
}): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKS, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.put({ id, ...data, updatedAt: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getBookOffline(id: string): Promise<any> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKS, 'readonly');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOfflineBooks(): Promise<any[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKS, 'readonly');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function removeBookOffline(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKS, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
