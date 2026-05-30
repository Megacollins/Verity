import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for pdf-parse to work in API routes (it uses Node.js built-ins)
  serverExternalPackages: ['pdf-parse'],

  // Increase the body size limit for invoice PDF uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
