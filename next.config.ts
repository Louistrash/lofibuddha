import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization: serve WebP by default, optimize public images
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compression for better Lighthouse scores
  compress: true,
  // Enable React strict mode for better dev catches
  reactStrictMode: true,
  // Proxy hermes agent API
  async rewrites() {
    return [
      {
        source: "/hermes-proxy/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
  // Output as standalone for Docker/VPS deployment
  output: "standalone",
};

export default nextConfig;
