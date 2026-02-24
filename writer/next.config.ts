import type { NextConfig } from "next";
import path from "path";

const monorepoRoot = path.resolve(__dirname, '..');
const sharedPath = path.resolve(monorepoRoot, 'shared');

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {
      '@shared': sharedPath,
    },
  },
};

export default nextConfig;
