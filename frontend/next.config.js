/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // allow localhost and placeholder photos by default; add Vercel hostname if present
    domains: (() => {
      const d = ['localhost', 'picsum.photos'];
      if (process.env.VERCEL_URL) d.push(process.env.VERCEL_URL);
      return d;
    })(),
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

