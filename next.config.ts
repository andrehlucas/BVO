import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  output: process.env.VERCEL ? undefined : 'standalone',
}

export default nextConfig
