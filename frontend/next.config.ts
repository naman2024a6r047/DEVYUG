import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Unsplash (used for product/blog images in dev/seed)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Cloudinary (for admin-uploaded product images in production)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Cloudinary vanity domains (if configured)
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      // Google user content (for Google OAuth profile pictures)
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // General CDN fallback — allow any HTTPS image (useful for dynamic product URLs)
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
