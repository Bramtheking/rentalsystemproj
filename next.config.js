/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove conflicting configurations
  experimental: {
    esmExternals: "loose",
  },
  // Only transpile recharts, not firebase
  transpilePackages: ["recharts"],
  webpack: (config, { isServer, webpack }) => {
    // Client-side configuration
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: false,
      }
    }

    // Handle ES modules properly
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    })

    // Ignore problematic Node.js modules on client
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(undici|node:.*|@firebase\/auth\/dist\/node-esm)$/,
      }),
    )

    return config
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "https://rentalsystemmanagement.onrender.com/api/:path*"
            : "http://localhost:8000/api/:path*",
      },
    ]
  },
  images: {
    domains: ["localhost", "rentalsystemmanagement.onrender.com"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure proper output
  output: "standalone",
}

module.exports = nextConfig
