"use server";

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3-client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getPresignedUploadUrl(key: string, contentType: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // URL valid for 60 seconds
  const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  
  return url;
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 3600) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

function extractKeyFromUrl(input: string): string {
  if (!input) return "";
  // If it's already just a key (doesn't look like a URL), return it
  if (!input.startsWith("http") && !input.startsWith("https")) {
    return input.startsWith("/") ? input.substring(1) : input;
  }

  try {
    const url = new URL(input);
    const bucketName = process.env.S3_BUCKET_NAME;
    let pathname = url.pathname;
    
    // Pattern 1: B2 Native URL /file/bucket-name/key
    if (pathname.startsWith("/file/")) {
      const parts = pathname.split("/").filter(Boolean);
      // parts[0] is "file", parts[1] is "bucket-name", parts[2] is the start of the key
      if (parts.length >= 3) {
        return parts.slice(2).join("/");
      }
    }
    
    // Pattern 2 & 3: S3-style Path-based or Virtual-hosted
    // Path-based: /bucket-name/key
    // Virtual-hosted: /key (bucket is in subdomain)
    
    // First, decode the pathname
    pathname = decodeURIComponent(pathname);
    let key = pathname.startsWith("/") ? pathname.substring(1) : pathname;
    
    // If the bucket name is the first part of the path (Path-based), strip it
    if (bucketName && key.startsWith(`${bucketName}/`)) {
      key = key.substring(bucketName.length + 1);
    }
    
    console.log(`[extractKeyFromUrl] Extracted key: "${key}" from "${input}"`);
    return key;
  } catch (e) {
    console.warn(`[extractKeyFromUrl] Failed to parse URL "${input}", returning as-is`, e);
    return input;
  }
}

export async function deleteFromStorageAction(keyOrUrl: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const key = extractKeyFromUrl(keyOrUrl);
  console.log(`[deleteFromStorageAction] Deleting key: "${key}" (derived from "${keyOrUrl}")`);

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    console.log(`[deleteFromStorageAction] Successfully sent delete command for key: ${key}. Response:`, response.$metadata.httpStatusCode);
    return { success: true };
  } catch (error) {
    console.error(`[deleteFromStorageAction] Failed to delete key "${key}":`, error);
    // We don't necessarily want to crash the whole process if a file is already gone
    return { success: false, error: "Storage deletion failed" };
  }
}
