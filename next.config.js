/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy API requests to Django backend in production
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8000/api/:path*",
        },
      ]
    }
    return []
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
