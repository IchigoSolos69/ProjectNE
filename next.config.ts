import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: ["bcryptjs", "@prisma/client"],
};

export default nextConfig;
