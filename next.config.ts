import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for pdf-parse to work in API routes (it uses Node.js built-ins)
  serverExternalPackages: ['pdf-parse', 'pdfkit'],
};

export default nextConfig;
