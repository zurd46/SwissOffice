import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['../shared'],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
