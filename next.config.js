// next.config.js
// const nextConfig = {
//   images: {
//     domains: ['avatars.githubusercontent.com'],
//   },
// }

// module.exports = nextConfig


// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
