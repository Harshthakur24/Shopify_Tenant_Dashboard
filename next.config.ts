import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  outputFileTracingRoot: __dirname,
  // next@15: use serverExternalPackages (replaces experimental.serverComponentsExternalPackages)
  serverExternalPackages: ["@prisma/client", "prisma"],
  // Skip linting and type checking during build for faster deployments
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@prisma/client': '@prisma/client',
        'bcryptjs': 'bcryptjs'
      });
    }
    return config;
  },
};

export default nextConfig;
