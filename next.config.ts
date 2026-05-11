/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'f003.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: 'pageturner-vault.s3.eu-central-003.backblazeb2.com',
      }
    ],
  },
  // Compatibility with Next.js 16+ Turbopack
  turbopack: {}
};

export default nextConfig;
