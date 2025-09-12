/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow Shopify CDN images and Unsplash images
    domains: ['cdn.shopify.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;


