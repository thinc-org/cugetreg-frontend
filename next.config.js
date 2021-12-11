/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const withOptimizedImages = require('next-optimized-images')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withPlugins([[withBundleAnalyzer], [withOptimizedImages]], {
  // other options here
  env: {
    IS_PULL_REQUEST: process.env.IS_PULL_REQUEST,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty',
      }
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/apiProxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/:path*`,
      },
    ]
  },
})
