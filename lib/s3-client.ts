import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.S3_ENDPOINT) {
  console.warn("S3_ENDPOINT is not set. Backblaze B2 will not work correctly.");
}

export const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-west-004", // Backblaze region (e.g., us-west-004)
  endpoint: `https://${process.env.S3_ENDPOINT}`, // e.g., s3.us-west-004.backblazeb2.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});
