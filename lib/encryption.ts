/**
 * Zero-Knowledge Encryption Utility
 * Uses Web Crypto API (AES-GCM 256-bit)
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Generates a random cryptographic key
 */
export async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a key to a base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Imports a key from a base64 string
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const binaryString = atob(base64Key);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return await crypto.subtle.importKey(
    'raw',
    bytes,
    ALGORITHM,
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a file (ArrayBuffer)
 */
export async function encryptData(data: ArrayBuffer, key: CryptoKey): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encryptedData = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    data
  );
  return { encryptedData, iv };
}

/**
 * Decrypts a file (ArrayBuffer)
 */
export async function decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: new Uint8Array(iv) },
    key,
    encryptedData
  );
}

/**
 * Helper to combine IV and encrypted data into a single blob for storage
 * [IV (12 bytes)][Encrypted Data]
 */
export function packEncryptedBlob(encryptedData: ArrayBuffer, iv: Uint8Array): Blob {
  return new Blob([new Uint8Array(iv), encryptedData], { type: 'application/octet-stream' });
}

/**
 * Helper to unpack an encrypted blob back into IV and encrypted data
 */
export async function unpackEncryptedBlob(blob: Blob): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const buffer = await blob.arrayBuffer();
  const iv = new Uint8Array(buffer.slice(0, 12));
  const encryptedData = buffer.slice(12);
  return { encryptedData, iv };
}
