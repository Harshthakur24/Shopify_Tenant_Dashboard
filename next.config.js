/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopack: {
      // Force Next to treat this project directory as the workspace root
      root: __dirname,
    },
  },
};

module.exports = nextConfig;


