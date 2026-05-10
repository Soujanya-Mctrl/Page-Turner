"use server";

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
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
