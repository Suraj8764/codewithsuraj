import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // Allow server-side mongoose model registration
  serverExternalPackages: ['mongoose'],
  experimental: {
    // Enable server actions
  },
};

export default nextConfig;
