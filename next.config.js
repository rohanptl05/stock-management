/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'avatars.githubusercontent.com'],
  },
  webpack: (config, { isServer }) => {
    // Disable Webpack caching
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;