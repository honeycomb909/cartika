/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'picsum.photos', process.env.VERCEL_URL],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    unoptimized: true,
  },
  env: {
    // NOTE: should be the base backend URL (no trailing /api) so image paths like
    // `/uploads/...` resolve correctly when prefixed. Override with .env.local if needed.
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  }
}

module.exports = nextConfig

