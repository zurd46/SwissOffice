import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['../shared'],
  experimental: {
    externalDir: true,
  },
}

export default nextConfig
