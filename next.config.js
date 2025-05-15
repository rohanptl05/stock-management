// next.config.js
// const nextConfig = {
//   images: {
//     domains: ['avatars.githubusercontent.com'],
//   },
// }

// module.exports = nextConfig


// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
}
