import type { NextConfig } from "next";

const isStaticPreview = process.env.MOCK_PREVIEW === "true";

const imageRemotePatterns = [
  {
    protocol: "https" as const,
    hostname: "images.unsplash.com",
  },
];

const nextConfig: NextConfig = {
  ...(isStaticPreview
    ? {
        output: "export",
        images: {
          unoptimized: true,
          remotePatterns: imageRemotePatterns,
        },
        turbopack: {
          resolveAlias: {
            "@/components/checkout/checkout-actions":
              "./src/components/checkout/checkout-actions.preview.ts",
          },
        },
      }
    : {
        images: {
          remotePatterns: imageRemotePatterns,
        },
      }),
};

export default nextConfig;
