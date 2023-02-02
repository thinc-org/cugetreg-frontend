//@ts-check
const path = require('path')

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// })

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  productionBrowserSourceMaps: true,
  // env: {
  //   IS_PULL_REQUEST: process.env.IS_PULL_REQUEST,
  // },
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) config.resolve.fallback.fs = false
    return config
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []
    return [
      {
        source: '/apiProxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
      },
    ]
  },
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    transpilePackages: ['@cgr/course-utils', '@cgr/codegen'],
  },
}

module.exports = nextConfig
