export function getPublicUrl(key: string | null) {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  
  const domain = process.env.NEXT_PUBLIC_S3_PUBLIC_DOMAIN;
  if (!domain) {
    console.warn("NEXT_PUBLIC_S3_PUBLIC_DOMAIN is not set.");
    return key;
  }
  
  return `https://${domain}/${key}`;
}
